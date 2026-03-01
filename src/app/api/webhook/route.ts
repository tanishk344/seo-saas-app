import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { userService, firebase } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

interface SubscriptionData {
  current_period_end: number;
  status: string;
  customer: string;
}

export async function POST(request: NextRequest) {
  const stripeInstance = getStripe();
  
  if (!stripeInstance) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripeInstance.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as { metadata: { userId: string }; subscription: string };

        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId) as unknown as SubscriptionData;
          const expiresAt = new Date(subscription.current_period_end * 1000);

          await userService.updateUserPlan(userId, "pro", {
            stripeId: subscriptionId,
            status: subscription.status,
            expiresAt,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as SubscriptionData;
        const customerId = subscription.customer;
        
        const q = query(
          collection(firebase.db, "users"),
          where("subscription.stripeId", "==", customerId)
        );
        const usersRef = await getDocs(q);
        
        if (!usersRef.empty) {
          const userId = usersRef.docs[0].id;
          const expiresAt = new Date(subscription.current_period_end * 1000);

          await userService.updateUserPlan(userId, subscription.status === "active" ? "pro" : "free", {
            stripeId: customerId,
            status: subscription.status,
            expiresAt,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as SubscriptionData;
        const customerId = subscription.customer;
        
        const q = query(
          collection(firebase.db, "users"),
          where("subscription.stripeId", "==", customerId)
        );
        const usersRef = await getDocs(q);
        
        if (!usersRef.empty) {
          const userId = usersRef.docs[0].id;
          await userService.updateUserPlan(userId, "free");
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
