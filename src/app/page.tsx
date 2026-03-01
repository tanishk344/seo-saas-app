import Link from "next/link";
import { 
  Search, 
  Key, 
  FileText, 
  Link2, 
  Users, 
  Zap, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "SEO Audit",
    description: "Analyze your website's SEO health with comprehensive checks on meta tags, headings, images, and more."
  },
  {
    icon: Key,
    title: "Keyword Tracking",
    description: "Track your keyword rankings over time and monitor your progress in search engine results."
  },
  {
    icon: FileText,
    title: "AI Content Generation",
    description: "Generate SEO-optimized content with AI. Create blog posts, product descriptions, and more."
  },
  {
    icon: Link2,
    title: "Backlink Analysis",
    description: "Analyze your backlink profile and discover new link-building opportunities."
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    description: "Compare your SEO performance with up to 3 competitors and identify improvement areas."
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get instant insights and track your SEO metrics in real-time with our powerful dashboard."
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "10 SEO audits per month",
      "5 keyword tracking",
      "10 AI content generations",
      "Basic backlink analysis",
      "Email support"
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    description: "For serious marketers",
    features: [
      "Unlimited SEO audits",
      "Unlimited keyword tracking",
      "Unlimited AI content",
      "Advanced backlink analysis",
      "Competitor analysis",
      "Priority support",
      "API access"
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    popular: true
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SEOPro</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered SEO Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Boost Your Search
              <span className="block gradient-text">Rankings with AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Complete SEO toolkit with audit tools, keyword tracking, AI content generation, and competitor analysis. All in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Start Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need for SEO Success
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools to analyze, optimize, and track your SEO performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 ${
                  plan.popular 
                    ? 'ring-2 ring-primary-500 shadow-xl' 
                    : 'shadow-sm border border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== "$0" && (
                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`inline-flex items-center justify-center w-full h-12 font-medium rounded-xl transition-colors ${
                    plan.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">SEOPro</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 SEOPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
