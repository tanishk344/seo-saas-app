"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FREE_LIMITS } from "@/config/firebase";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      `${FREE_LIMITS.audits} SEO audits per month`,
      `${FREE_LIMITS.keywords} keyword tracking`,
      `${FREE_LIMITS.contentGenerations} AI content generations`,
      "Basic backlink analysis",
      "Email support",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For serious marketers",
    features: [
      "Unlimited SEO audits",
      "Unlimited keyword tracking",
      "Unlimited AI content generations",
      "Advanced backlink analysis",
      "Competitor analysis",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    popular: true,
  },
];

export default function PricingPage() {
  const { user, appUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isPro = appUser?.plan === "pro";

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (planName !== "Pro") {
      router.push("/signup");
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          plan: "pro",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start checkout";
      showToast("error", errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href={user ? "/dashboard" : "/"}
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "ring-2 ring-primary-500 shadow-xl" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary-500 text-white px-4 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== "$0" && (
                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isPro && plan.name === "Pro" ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.name)}
                    loading={loading === plan.name}
                    className="w-full"
                    variant={plan.popular ? "primary" : "secondary"}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We accept all major credit cards, debit cards, and PayPal through our secure payment provider Stripe.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! The Pro plan comes with a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
