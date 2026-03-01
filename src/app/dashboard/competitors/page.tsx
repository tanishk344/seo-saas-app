"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner, LoadingOverlay } from "@/components/ui/Spinner";
import { Plus, Trash2, Search, Globe } from "lucide-react";
import type { CompetitorData } from "@/types";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts";

const MAX_COMPETITORS = 3;

export default function CompetitorsPage() {
  const { showToast } = useToast();
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CompetitorData[]>([]);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompetitor.trim()) {
      showToast("error", "Please enter a domain");
      return;
    }

    if (competitors.length >= MAX_COMPETITORS) {
      showToast("error", `You can compare up to ${MAX_COMPETITORS} competitors`);
      return;
    }

    setCompetitors([...competitors, newCompetitor.trim()]);
    setNewCompetitor("");
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
    setResults(results.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (competitors.length === 0) {
      showToast("error", "Add at least one competitor to analyze");
      return;
    }

    setAnalyzing(true);
    setResults([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockResults: CompetitorData[] = competitors.map((domain) => ({
        domain,
        authority: Math.floor(Math.random() * 80) + 10,
        backlinks: Math.floor(Math.random() * 10000) + 100,
        organicKeywords: Math.floor(Math.random() * 50000) + 1000,
        traffic: Math.floor(Math.random() * 500000) + 10000,
      }));

      setResults(mockResults);
    } catch {
      showToast("error", "Failed to analyze competitors");
    } finally {
      setAnalyzing(false);
    }
  };

  const getRadarData = () => {
    if (results.length === 0) return [];
    
    const data: Record<string, unknown>[] = [
      { metric: "Authority" },
      { metric: "Backlinks" },
      { metric: "Keywords" },
      { metric: "Traffic" },
    ];
    
    results.forEach((r) => {
      const key = r.domain.replace(/\./g, "");
      data[0][key] = r.authority;
      data[1][key] = Math.min(r.backlinks / 100, 100);
      data[2][key] = Math.min(r.organicKeywords / 500, 100);
      data[3][key] = Math.min(r.traffic / 5000, 100);
    });
    
    return data;
  };

  const radarData = getRadarData();

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Competitor Analysis
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Compare your SEO performance with competitors
        </p>
      </div>

      {/* Add Competitors */}
      <Card>
        <CardHeader>
          <CardTitle>Add Competitors</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter competitor domain (e.g., competitor.com)"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={competitors.length >= MAX_COMPETITORS}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </form>

          {/* Competitor List */}
          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {competitors.map((domain, index) => (
                <Badge key={index} variant="default" className="flex items-center gap-2 px-3 py-1">
                  <Globe className="w-3 h-3" />
                  {domain}
                  <button onClick={() => handleRemoveCompetitor(index)} className="ml-1 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={analyzing || competitors.length === 0} className="w-full sm:w-auto">
            {analyzing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Competitors
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Metric
                      </th>
                      {results.map((r) => (
                        <th
                          key={r.domain}
                          className="text-left py-3 px-4 text-sm font-medium text-slate-900 dark:text-white"
                        >
                          {r.domain}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">Authority</td>
                      {results.map((r) => (
                        <td key={r.domain} className="py-3 px-4">
                          <Badge
                            variant={
                              r.authority >= 70
                                ? "success"
                                : r.authority >= 40
                                ? "warning"
                                : "default"
                            }
                          >
                            {r.authority}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">Backlinks</td>
                      {results.map((r) => (
                        <td key={r.domain} className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                          {r.backlinks.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">Organic Keywords</td>
                      {results.map((r) => (
                        <td key={r.domain} className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                          {r.organicKeywords.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">Traffic</td>
                      {results.map((r) => (
                        <td key={r.domain} className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                          {r.traffic.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {results.map((r, i) => (
                      <Radar
                        key={r.domain}
                        name={r.domain}
                        dataKey={r.domain.replace(/\./g, "")}
                        stroke={colors[i % colors.length]}
                        fill={colors[i % colors.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading */}
      {analyzing && <LoadingOverlay message="Analyzing competitors..." />}
    </div>
  );
}
