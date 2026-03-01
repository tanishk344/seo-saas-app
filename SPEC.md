# SEO SaaS Application Specification

## Project Overview
- **Project Name**: SEOPro - SEO SaaS Platform
- **Type**: Full-stack web application (SaaS)
- **Core Functionality**: AI-powered SEO toolkit with audit, keyword tracking, content generation, and analytics
- **Target Users**: Digital marketers, content creators, SEO professionals, small business owners
- **Deployment**: Vercel

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: Groq API
- **Payments**: Stripe
- **Charts**: Recharts

---

## UI/UX Specification

### Color Palette
```css
--primary: #6366f1 (Indigo-500)
--primary-dark: #4f46e5 (Indigo-600)
--primary-light: #818cf8 (Indigo-400)
--secondary: #10b981 (Emerald-500)
--accent: #f59e0b (Amber-500)
--danger: #ef4444 (Red-500)
--dark-bg: #0f172a (Slate-900)
--dark-card: #1e293b (Slate-800)
--dark-border: #334155 (Slate-700)
--light-bg: #f8fafc (Slate-50)
--light-card: #ffffff
--light-border: #e2e8f0 (Slate-200)
--text-dark: #f1f5f9 (Slate-100)
--text-light: #0f172a (Slate-900)
--text-muted: #94a3b8 (Slate-400)
```

### Typography
- **Font Family**: "Inter" for body, "Space Grotesk" for headings
- **Headings**: 
  - H1: 2.5rem/40px, font-weight 700
  - H2: 2rem/32px, font-weight 600
  - H3: 1.5rem/24px, font-weight 600
  - H4: 1.25rem/20px, font-weight 500
- **Body**: 1rem/16px, font-weight 400
- **Small**: 0.875rem/14px

### Spacing System
- Base unit: 4px
- Scale: 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px), 16(64px)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Structure

#### Dashboard Layout
- **Sidebar**: 280px width (hidden on mobile, collapsible)
- **Header**: 64px height with user menu
- **Main Content**: Fluid width with max-width 1400px
- **Mobile**: Bottom navigation bar

#### Page Layout
- Max width: 1400px
- Padding: 24px (desktop), 16px (mobile)
- Card-based content sections

### Components

#### Buttons
- Primary: Indigo background, white text, rounded-lg
- Secondary: White/gray background, dark text
- Danger: Red background for destructive actions
- States: hover (darken 10%), active (darken 15%), disabled (opacity 50%)
- Sizes: sm (32px), md (40px), lg (48px)

#### Cards
- Background: white (light) / slate-800 (dark)
- Border radius: 12px
- Shadow: 0 4px 6px -1px rgba(0,0,0,0.1)
- Padding: 24px

#### Form Inputs
- Height: 44px
- Border: 1px solid slate-300
- Border radius: 8px
- Focus: ring-2 indigo-500

#### Tables
- Striped rows (alternate slate-50/white)
- Hover: slate-100
- Sticky header

#### Toast Notifications
- Position: top-right
- Duration: 5 seconds
- Types: success (green), error (red), warning (amber), info (blue)

### Animations
- Page transitions: fade-in 200ms
- Button hover: scale 1.02
- Card hover: translateY(-2px), shadow increase
- Loading: pulse animation
- Charts: animated on mount

---

## Pages Structure

### Public Pages

#### `/` - Landing Page
- Hero section with CTA
- Features grid
- Pricing preview
- Testimonials
- Footer

#### `/login` - Login Page
- Email/password form
- "Forgot password" link
- "Sign up" link
- Social login buttons (Google)

#### `/signup` - Sign Up Page
- Name, email, password fields
- Terms checkbox
- Submit button

#### `/pricing` - Pricing Page
- Free plan card
- Pro plan card ($29/month)
- Feature comparison
- Stripe checkout button

### Protected Pages (Dashboard)

#### `/dashboard` - Main Dashboard
- Welcome message
- Stats cards (audits, keywords, content, rank)
- Quick actions
- Recent activity
- Usage meter (free users)

#### `/dashboard/audit` - SEO Audit Tool
- URL input form
- Analyze button
- Loading state with progress
- Score display (circular progress)
- Detailed report sections:
  - Meta tags analysis
  - Headings structure
  - Images (alt text check)
  - Links (broken links check)
  - Mobile friendliness
  - SSL status
- Save audit button

#### `/dashboard/keywords` - Keyword Tracker
- Add keyword form
- Keywords table with:
  - Keyword
  - Current rank
  - Change indicator
  - History sparkline
- Free: 5 keywords limit
- Pro: Unlimited with upgrade prompt

#### `/dashboard/content` - AI Content Generator
- Form:
  - Topic input
  - Content type dropdown (blog post, product description, etc.)
  - Tone dropdown (professional, casual, etc.)
  - Length slider (short/medium/long)
- Generate button
- Loading state
- Generated content display
- Save button
- Copy to clipboard
- Word count display
- Free: 10 generations limit

#### `/dashboard/backlinks` - Backlink Analyzer
- Domain input
- Analyze button
- Results:
  - Total backlinks count
  - Referring domains
  - Backlink types chart (dofollow/nofollow)
  - Top referring domains list

#### `/dashboard/competitors` - Competitor Analysis
- Add competitors form (up to 3)
- Comparison table:
  - Domain authority
  - Backlinks
  - Organic keywords
  - Traffic estimate
- Radar chart comparison

#### `/dashboard/profile` - User Profile
- User info display
- Edit form
- Subscription status
- Usage statistics
- Delete account option

---

## Database Schema (Firestore)

### Collection: users/{userId}
```typescript
{
  email: string;
  name: string;
  plan: 'free' | 'pro';
  createdAt: Timestamp;
  usage: {
    audits: number;
    keywords: number;
    contentGenerations: number;
    month: string; // "2024-01"
  };
  subscription: {
    stripeId: string | null;
    status: string | null;
    expiresAt: Timestamp | null;
  } | null;
}
```

### Collection: audits/{auditId}
```typescript
{
  userId: string;
  url: string;
  date: Timestamp;
  score: number;
  results: {
    meta: { title: string; description: string; score: number };
    headings: { h1: number; h2: number; h3: number; score: number };
    images: { total: number; withAlt: number; score: number };
    links: { total: number; broken: number; score: number };
    mobile: { friendly: boolean; score: number };
    ssl: { enabled: boolean; score: number };
  };
}
```

### Collection: keywords/{keywordId}
```typescript
{
  userId: string;
  keyword: string;
  currentRank: number;
  history: Array<{
    rank: number;
    date: Timestamp;
  }>;
  createdAt: Timestamp;
}
```

### Collection: content/{contentId}
```typescript
{
  userId: string;
  topic: string;
  contentType: string;
  tone: string;
  generatedContent: string;
  createdAt: Timestamp;
}
```

---

## Functionality Specification

### Authentication Flow
1. User signs up with email/password
2. Firebase creates user account
3. Firestore user document created with default values
4. Redirect to dashboard

### SEO Audit Flow
1. User enters URL
2. Validate URL format
3. Fetch page content via API route (server-side)
4. Analyze:
   - Meta tags (title, description, OG tags)
   - Headings (H1-H6 count)
   - Images (alt text presence)
   - Links (validate with HEAD request)
   - Mobile friendliness (viewport meta)
   - SSL (https check)
5. Calculate weighted score
6. Display results
7. Save to Firestore on button click
8. Update usage count for free users

### Keyword Tracking Flow
1. User adds keyword
2. Check free user limit (max 5)
3. Store in Firestore
4. Simulate rank check (mock data for demo)
5. Store rank history
6. Display in table with trends

### AI Content Generation Flow
1. User fills form
2. Check free user limit (max 10/month)
3. Build prompt for Groq
4. Call Groq API
5. Display generated content
6. Save to Firestore on button click

### Subscription Flow
1. User clicks upgrade on pricing page
2. Call Stripe checkout session API
3. Redirect to Stripe
4. On success, webhook updates user plan
5. Redirect to dashboard with success message

---

## Acceptance Criteria

### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] Protected routes redirect to login
- [ ] User profile shows correct data

### SEO Audit
- [ ] URL validation works
- [ ] All 6 checks return results
- [ ] Score calculates correctly
- [ ] Results save to database
- [ ] Free users usage tracked

### Keyword Tracker
- [ ] Add keyword works
- [ ] Table displays all keywords
- [ ] Free limit enforced (5)
- [ ] Rank history displays

### Content Generator
- [ ] Form validates inputs
- [ ] Groq API returns content
- [ ] Free limit enforced (10/month)
- [ ] Content saves to database

### Backlinks
- [ ] Domain input works
- [ ] Mock data displays
- [ ] Charts render correctly

### Competitors
- [ ] Can add up to 3 domains
- [ ] Comparison table works

### Subscription
- [ ] Pricing page displays plans
- [ ] Stripe checkout initiates
- [ ] Webhook updates user plan

### UI/UX
- [ ] Dark/light mode works
- [ ] Mobile responsive
- [ ] Loading states display
- [ ] Toast notifications work
- [ ] Sidebar navigation works
