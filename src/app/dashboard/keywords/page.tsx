"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { keywordService, userService } from "@/lib/firebase";
import { FREE_LIMITS } from "@/config/firebase";
import { getRankChange, getRankChangeNumber } from "@/lib/utils";
import type { Keyword } from "@/types";
import Link from "next/link";

export default function KeywordsPage() {
  const { user, appUser, refreshAppUser } = useAuth();
  const { showToast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isFree = appUser?.plan === "free";
  const keywordLimit = isFree ? FREE_LIMITS.keywords : Infinity;
  const canAdd = keywords.length < keywordLimit || !isFree;

  useEffect(() => {
    async function fetchKeywords() {
      if (!user) return;
      
      try {
        const data = await keywordService.getKeywords(user.uid);
        setKeywords(data);
      } catch {
        console.error("Error fetching keywords:");
      } finally {
        setLoading(false);
      }
    }

    fetchKeywords();
  }, [user]);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyword.trim()) {
      showToast("error", "Please enter a keyword");
      return;
    }

    if (!canAdd && isFree) {
      showToast("warning", `You've reached your limit of ${FREE_LIMITS.keywords} keywords. Upgrade to Pro for unlimited!`);
      return;
    }

    setSaving(true);
    try {
      await keywordService.addKeyword(user!.uid, newKeyword.trim());
      await userService.updateUsage(user!.uid, "keywords");
      await refreshAppUser();
      
      const updatedKeywords = await keywordService.getKeywords(user!.uid);
      setKeywords(updatedKeywords);
      
      setNewKeyword("");
      showToast("success", "Keyword added successfully!");
    } catch {
      showToast("error", "Failed to add keyword");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    try {
      await keywordService.deleteKeyword(keywordId);
      setKeywords(keywords.filter((k) => k.id !== keywordId));
      showToast("success", "Keyword removed");
    } catch {
      showToast("error", "Failed to remove keyword");
    }
  };

  const renderRankChange = (keyword: Keyword) => {
    const change = getRankChange(keyword.history);
    const changeNum = getRankChangeNumber(keyword.history);

    if (change === "up") {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{changeNum}</span>
        </div>
      );
    }
    if (change === "down") {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{changeNum}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-slate-400">
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">0</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Keyword Tracker
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Track your keyword rankings over time
        </p>
      </div>

      {/* Usage Warning */}
      {isFree && !canAdd && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-200">
              You&apos;ve reached your monthly limit of {FREE_LIMITS.keywords} keywords.{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited keywords.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Keyword Form */}
      <Card>
        <CardContent className="py-6">
          <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter keyword to track (e.g., 'SEO tools')"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving || !canAdd}>
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Keywords ({keywords.length}/{keywordLimit})</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No keywords tracked yet. Add your first keyword to start tracking!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Keyword
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Current Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Change
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Added
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((keyword) => (
                    <tr
                      key={keyword.id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {keyword.keyword}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            keyword.currentRank <= 10
                              ? "success"
                              : keyword.currentRank <= 30
                              ? "warning"
                              : "default"
                          }
                        >
                          #{keyword.currentRank}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {renderRankChange(keyword)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(keyword.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKeyword(keyword.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
