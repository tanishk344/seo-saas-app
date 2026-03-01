"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner, LoadingOverlay } from "@/components/ui/Spinner";
import { Search, ExternalLink, Globe, Link as LinkIcon } from "lucide-react";
import type { BacklinkData } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];

export default function BacklinksPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BacklinkData | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      showToast("error", "Please enter a domain");
      return;
    }

    setAnalyzing(true);
    setResults(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockData: BacklinkData = {
        totalBacklinks: Math.floor(Math.random() * 5000) + 1000,
        referringDomains: Math.floor(Math.random() * 500) + 100,
        dofollow: Math.floor(Math.random() * 3000) + 500,
        nofollow: Math.floor(Math.random() * 1000) + 100,
        topDomains: [
          { domain: "google.com", backlinks: Math.floor(Math.random() * 500) + 100 },
          { domain: "facebook.com", backlinks: Math.floor(Math.random() * 300) + 50 },
          { domain: "twitter.com", backlinks: Math.floor(Math.random() * 200) + 30 },
          { domain: "linkedin.com", backlinks: Math.floor(Math.random() * 150) + 20 },
          { domain: "wikipedia.org", backlinks: Math.floor(Math.random() * 100) + 10 },
        ],
      };

      setResults(mockData);
    } catch {
      showToast("error", "Failed to analyze backlinks");
    } finally {
      setAnalyzing(false);
    }
  };

  const pieData = results
    ? [
        { name: "DoFollow", value: results.dofollow },
        { name: "NoFollow", value: results.nofollow },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Backlink Analyzer
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Analyze your website&apos;s backlink profile
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={analyzing}>
              {analyzing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
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
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Backlinks</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {results.totalBacklinks.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Referring Domains</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {results.referringDomains.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">DoFollow Links</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {results.dofollow.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">NoFollow Links</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {results.nofollow.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Link Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Link Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Referring Domains */}
            <Card>
              <CardHeader>
                <CardTitle>Top Referring Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.topDomains.map((item, index) => (
                    <div
                      key={item.domain}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {item.domain}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.backlinks.toLocaleString()}
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading */}
      {analyzing && <LoadingOverlay message="Analyzing backlinks..." />}
    </div>
  );
}
