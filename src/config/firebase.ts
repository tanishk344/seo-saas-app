// Firebase configuration
// Replace with your Firebase config from the Firebase Console

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Stripe configuration
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_demo";

// Groq API configuration
export const groqApiKey = process.env.GROQ_API_KEY || "";

// App configuration
export const APP_NAME = "SEOPro";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Plan limits
export const FREE_LIMITS = {
  audits: 10,
  keywords: 5,
  contentGenerations: 10,
};

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly";
