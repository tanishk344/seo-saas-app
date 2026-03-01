import { Timestamp } from "firebase/firestore";

export type UserPlan = "free" | "pro";

export interface UserUsage {
  audits: number;
  keywords: number;
  contentGenerations: number;
  month: string;
}

export interface UserSubscription {
  stripeId: string | null;
  status: string | null;
  expiresAt: Timestamp | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  createdAt: Date;
  usage: UserUsage;
  subscription: UserSubscription | null;
}

export interface AuditResults {
  meta: {
    title: string;
    description: string;
    score: number;
  };
  headings: {
    h1: number;
    h2: number;
    h3: number;
    score: number;
  };
  images: {
    total: number;
    withAlt: number;
    score: number;
  };
  links: {
    total: number;
    broken: number;
    score: number;
  };
  mobile: {
    friendly: boolean;
    score: number;
  };
  ssl: {
    enabled: boolean;
    score: number;
  };
}

export interface Audit {
  id: string;
  userId: string;
  url: string;
  date: Date;
  score: number;
  results: AuditResults;
}

export interface KeywordHistory {
  rank: number;
  date: Date;
}

export interface Keyword {
  id: string;
  userId: string;
  keyword: string;
  currentRank: number;
  history: KeywordHistory[];
  createdAt: Date;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  topic: string;
  contentType: string;
  tone: string;
  generatedContent: string;
  createdAt: Date;
}

export type ContentType = 
  | "blog-post"
  | "product-description"
  | "landing-page"
  | "social-media"
  | "email-newsletter"
  | "faq";

export type ContentTone = 
  | "professional"
  | "casual"
  | "friendly"
  | "authoritative"
  | "humorous";

export type ContentLength = "short" | "medium" | "long";

export interface BacklinkData {
  totalBacklinks: number;
  referringDomains: number;
  dofollow: number;
  nofollow: number;
  topDomains: Array<{
    domain: string;
    backlinks: number;
  }>;
}

export interface CompetitorData {
  domain: string;
  authority: number;
  backlinks: number;
  organicKeywords: number;
  traffic: number;
}
