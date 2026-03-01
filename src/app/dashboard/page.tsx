"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { 
  Search, 
  Key, 
  FileText, 
  TrendingUp,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { auditService, keywordService, contentService } from "@/lib/firebase";
import { FREE_LIMITS } from "@/config/firebase";
import type { Audit, Keyword, GeneratedContent } from "@/types";

export default function DashboardPage() {
  const { appUser, user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        const [auditsData, keywordsData, contentsData] = await Promise.all([
          auditService.getAudits(user.uid),
          keywordService.getKeywords(user.uid),
          contentService.getContent(user.uid),
        ]);
        
        setAudits(auditsData);
        setKeywords(keywordsData);
        setContents(contentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Audits",
      value: audits.length,
      icon: Search,
      href: "/dashboard/audit",
      color: "bg-blue-500",
    },
    {
      label: "Keywords Tracked",
      value: keywords.length,
      icon: Key,
      href: "/dashboard/keywords",
      color: "bg-green-500",
    },
    {
      label: "Content Generated",
      value: contents.length,
      icon: FileText,
      href: "/dashboard/content",
      color: "bg-purple-500",
    },
    {
      label: "Avg. Audit Score",
      value: audits.length > 0 
        ? Math.round(audits.reduce((sum, a) => sum + a.score, 0) / audits.length)
        : 0,
      icon: TrendingUp,
      href: "/dashboard/audit",
      color: "bg-amber-500",
    },
  ];

  const isFree = appUser?.plan === "free";
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usage = appUser?.usage?.month === currentMonth ? appUser.usage : { audits: 0, keywords: 0, contentGenerations: 0 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {appUser?.name || "User"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s an overview of your SEO performance
          </p>
        </div>
        {isFree && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Usage Meter (Free Users) */}
      {isFree && (
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Monthly Usage
              </span>
              <Badge variant="warning">Free Plan</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Audits</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {usage.audits}/{FREE_LIMITS.audits}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Keywords</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {keywords.length}/{FREE_LIMITS.keywords}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Content</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {usage.contentGenerations}/{FREE_LIMITS.contentGenerations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <CardContent className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/audit"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">New Audit</span>
              <ArrowRight className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" />
            </Link>
            <Link
              href="/dashboard/keywords"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-900 dark:text-green-100">Track Keyword</span>
              <ArrowRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
            </Link>
            <Link
              href="/dashboard/content"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-900 dark:text-purple-100">Generate Content</span>
              <ArrowRight className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" />
            </Link>
            <Link
              href="/dashboard/backlinks"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-900 dark:text-amber-100">Analyze Backlinks</span>
              <ArrowRight className="w-4 h-4 ml-auto text-amber-600 dark:text-amber-400" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Audits
              </h2>
              <Link
                href="/dashboard/audit"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                View All
              </Link>
            </div>
            {audits.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No audits yet. Start by running your first SEO audit!
              </p>
            ) : (
              <div className="space-y-3">
                {audits.slice(0, 5).map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {audit.url}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(audit.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        audit.score >= 80
                          ? "success"
                          : audit.score >= 50
                          ? "warning"
                          : "danger"
                      }
                    >
                      {audit.score}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Keywords */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Tracked Keywords
              </h2>
              <Link
                href="/dashboard/keywords"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                View All
              </Link>
            </div>
            {keywords.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No keywords tracked yet. Add your first keyword to track!
              </p>
            ) : (
              <div className="space-y-3">
                {keywords.slice(0, 5).map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {keyword.keyword}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Rank #{keyword.currentRank}
                      </p>
                    </div>
                    <Badge variant="default">#{keyword.currentRank}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
