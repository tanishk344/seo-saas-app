"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner, LoadingOverlay } from "@/components/ui/Spinner";
import { Copy, Save, Sparkles, AlertCircle } from "lucide-react";
import { contentService, userService } from "@/lib/firebase";
import { FREE_LIMITS } from "@/config/firebase";
import Link from "next/link";
import type { ContentType, ContentTone, ContentLength } from "@/types";

const contentTypes = [
  { value: "blog-post", label: "Blog Post" },
  { value: "product-description", label: "Product Description" },
  { value: "landing-page", label: "Landing Page Copy" },
  { value: "social-media", label: "Social Media Content" },
  { value: "email-newsletter", label: "Email Newsletter" },
  { value: "faq", label: "FAQ Content" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "humorous", label: "Humorous" },
];

const lengths = [
  { value: "short", label: "Short (100-150 words)" },
  { value: "medium", label: "Medium (300-400 words)" },
  { value: "long", label: "Long (600-800 words)" },
];

export default function ContentPage() {
  const { user, appUser, refreshAppUser } = useAuth();
  const { showToast } = useToast();
  
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("blog-post");
  const [tone, setTone] = useState<ContentTone>("professional");
  const [length, setLength] = useState<ContentLength>("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isFree = appUser?.plan === "free";
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usage = appUser?.usage?.month === currentMonth ? appUser.usage : { audits: 0, keywords: 0, contentGenerations: 0 };
  const contentLimit = isFree ? FREE_LIMITS.contentGenerations : Infinity;
  const canGenerate = usage.contentGenerations < contentLimit || !isFree;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      showToast("error", "Please enter a topic");
      return;
    }

    if (!canGenerate && isFree) {
      showToast("warning", `You've reached your monthly limit of ${FREE_LIMITS.contentGenerations} generations. Upgrade to Pro for unlimited!`);
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);
    setSaved(false);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, contentType, tone, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      setGeneratedContent(data.content);
      setWordCount(data.wordCount);
      
      await userService.updateUsage(user!.uid, "contentGenerations");
      await refreshAppUser();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
      showToast("error", errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !user) return;

    setSaving(true);
    try {
      await contentService.saveContent(user.uid, topic, contentType, tone, generatedContent);
      setSaved(true);
      showToast("success", "Content saved successfully!");
    } catch {
      showToast("error", "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    
    navigator.clipboard.writeText(generatedContent);
    showToast("success", "Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AI Content Generator
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Generate SEO-optimized content with AI
        </p>
      </div>

      {/* Usage Warning */}
      {isFree && !canGenerate && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-200">
              You&apos;ve reached your monthly limit of {FREE_LIMITS.contentGenerations} content generations.{" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited generations.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Configure your content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                id="topic"
                label="Topic"
                placeholder="Enter your topic (e.g., 'Benefits of SEO for small businesses')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />

              <Select
                id="contentType"
                label="Content Type"
                options={contentTypes}
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
              />

              <Select
                id="tone"
                label="Tone"
                options={tones}
                value={tone}
                onChange={(e) => setTone(e.target.value as ContentTone)}
              />

              <Select
                id="length"
                label="Length"
                options={lengths}
                value={length}
                onChange={(e) => setLength(e.target.value as ContentLength)}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={generating || !canGenerate}>
                  {generating ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content</CardTitle>
              {generatedContent && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {wordCount} words
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedContent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Configure your settings and click &quot;Generate Content&quot; to create AI-powered content
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {generatedContent.split("\n").map((line, i) => {
                      if (line.startsWith("# ")) {
                        return <h1 key={i} className="text-xl font-bold mt-4">{line.replace("# ", "")}</h1>;
                      }
                      if (line.startsWith("## ")) {
                        return <h2 key={i} className="text-lg font-semibold mt-3">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("### ")) {
                        return <h3 key={i} className="text-base font-medium mt-2">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("- ")) {
                        return <li key={i} className="ml-4">{line.replace("- ", "")}</li>;
                      }
                      if (line.trim() === "") {
                        return <br key={i} />;
                      }
                      return <p key={i} className="my-1">{line}</p>;
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleSave} disabled={saved || saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      {generating && <LoadingOverlay message="Generating content with AI..." />}
    </div>
  );
}
