"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner, LoadingOverlay } from "@/components/ui/Spinner";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { auditService, userService } from "@/lib/firebase";
import { FREE_LIMITS } from "@/config/firebase";
import { validateUrl } from "@/lib/utils";
import type { AuditResults } from "@/types";
import Link from "next/link";

export default function AuditPage() {
  const { user, appUser, refreshAppUser } = useAuth();
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    url: string;
    score: number;
    results: AuditResults;
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const isFree = appUser?.plan === "free";
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usage = appUser?.usage?.month === currentMonth ? appUser.usage : { audits: 0, keywords: 0, contentGenerations: 0 };
  const auditLimit = isFree ? FREE_LIMITS.audits : Infinity;
  const canAudit = usage.audits < auditLimit || !isFree;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      showToast("error", "Please enter a valid URL");
      return;
    }

    if (!canAudit && isFree) {
      showToast("warning", "You've reached your monthly audit limit. Upgrade to Pro for unlimited audits!");
      return;
    }

    setAnalyzing(true);
    setResults(null);
    setSaved(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze URL");
      }

      setResults(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze URL";
      showToast("error", errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!results || !user) return;

    setLoading(true);
    try {
      await auditService.createAudit(user.uid, results.url, results.score, results.results);
      await userService.updateUsage(user.uid, "audits");
      await refreshAppUser();
      setSaved(true);
      showToast("success", "Audit saved successfully!");
    } catch {
      showToast("error", "Failed to save audit");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const renderScoreCircle = (score: number) => {
    const circumference = 2 * Math.PI * 45;
    const progress = (score / 100) * circumference;
    
    return (
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={getScoreColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  const renderCheckItem = (label: string, itemResults: { score: number; [key: string]: unknown }) => {
    const passed = itemResults.score >= 70;
    
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <div className="flex items-center gap-3">
          {passed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium text-slate-900 dark:text-white">{label}</span>
        </div>
        <Badge variant={passed ? "success" : "danger"}>
          {itemResults.score}%
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          SEO Audit Tool
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Analyze your website&apos;s SEO health
        </p>
      </div>

      {/* Usage Warning */}
      {isFree && !canAudit && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-200">
              You&apos;ve reached your monthly limit of {FREE_LIMITS.audits} audits.{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited audits.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Audit Form */}
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={analyzing || !canAudit}>
              {analyzing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {renderScoreCircle(results.score)}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Overall SEO Score
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {results.score >= 80
                      ? "Great job! Your website is well-optimized for search engines."
                      : results.score >= 50
                      ? "Your website needs some improvements. Check the details below."
                      : "Your website needs significant improvements. Follow the suggestions below."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={saved || loading}
                      variant="secondary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saved ? "Saved!" : "Save Audit"}
                    </Button>
                    <Button variant="ghost">
                      <a href={results.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit URL
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Meta Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Meta Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckItem("Meta Tags", results.results.meta)}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Title: </span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {results.results.meta.title || "Not found"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Description: </span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {results.results.meta.description || "Not found"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Headings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Headings Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckItem("Headings", results.results.headings)}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-2">
                  <div className="flex items-center gap-4">
                    <Badge>H1: {results.results.headings.h1}</Badge>
                    <Badge>H2: {results.results.headings.h2}</Badge>
                    <Badge>H3: {results.results.headings.h3}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckItem("Images", results.results.images)}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {results.results.images.withAlt} of {results.results.images.total} images have alt text
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderCheckItem("Links", results.results.links)}
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {results.results.links.total} total links, {results.results.links.broken} broken links found
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Mobile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Mobile Friendly
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCheckItem("Mobile Friendly", results.results.mobile)}
              </CardContent>
            </Card>

            {/* SSL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  SSL (HTTPS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCheckItem("SSL", results.results.ssl)}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading State */}
      {analyzing && <LoadingOverlay message="Analyzing website..." />}
    </div>
  );
}
