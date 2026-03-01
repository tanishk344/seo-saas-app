import { NextRequest, NextResponse } from "next/server";
import { validateUrl } from "@/lib/utils";

interface AuditCheckResult {
  score: number;
  [key: string]: unknown;
}

async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkMetaTags(html: string): Promise<AuditCheckResult> {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);

  let score = 0;
  if (titleMatch && titleMatch[1]) score += 25;
  if (descMatch && descMatch[1] && descMatch[1].length >= 50) score += 25;
  if (ogTitleMatch && ogTitleMatch[1]) score += 25;
  if (ogDescMatch && ogDescMatch[1]) score += 25;

  return {
    title: titleMatch ? titleMatch[1].trim() : "Not found",
    description: descMatch ? descMatch[1].trim() : "Not found",
    score,
  };
}

async function checkHeadings(html: string): Promise<AuditCheckResult> {
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>/gi) || [];

  const h1 = h1Matches.length;
  const h2 = h2Matches.length;
  const h3 = h3Matches.length;

  let score = 0;
  if (h1 === 1) score += 40;
  else if (h1 > 1) score += 20;
  else score += 10;
  
  if (h2 >= 1) score += 30;
  if (h3 >= 1) score += 30;

  return {
    h1,
    h2,
    h3,
    score,
  };
}

async function checkImages(html: string): Promise<AuditCheckResult> {
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const total = imgMatches.length;
  
  let withAlt = 0;
  for (const img of imgMatches) {
    if (img.match(/alt=["'][^"']+["']/i)) {
      withAlt++;
    }
  }

  const score = total > 0 ? Math.round((withAlt / total) * 100) : 100;

  return {
    total,
    withAlt,
    score,
  };
}

async function checkLinks(html: string, baseUrl: string): Promise<AuditCheckResult> {
  const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
  const total = linkMatches.length;
  
  let broken = 0;
  const uniqueLinks = new Set<string>();
  
  for (const link of linkMatches) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/);
    if (!hrefMatch) continue;
    
    let href = hrefMatch[1];
    
    if (href.startsWith("/")) {
      try {
        const url = new URL(baseUrl);
        href = `${url.origin}${href}`;
      } catch {
        continue;
      }
    }
    
    if (!href.startsWith("http")) continue;
    
    if (uniqueLinks.has(href)) continue;
    uniqueLinks.add(href);
  }

  const sampleLinks = Array.from(uniqueLinks).slice(0, 5);
  
  for (const link of sampleLinks) {
    try {
      const response = await fetchWithTimeout(link, 3000);
      if (!response.ok) broken++;
    } catch {
      broken++;
    }
  }

  const score = total > 0 ? Math.max(0, 100 - Math.round((broken / Math.max(sampleLinks.length, 1)) * 100)) : 100;

  return {
    total,
    broken: broken + Math.round((broken / Math.max(sampleLinks.length, 1)) * (uniqueLinks.size - sampleLinks.length)),
    score,
  };
}

async function checkMobileFriendly(html: string): Promise<AuditCheckResult> {
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
  
  const friendly = !!viewportMatch;
  const score = friendly ? 100 : 0;

  return {
    friendly,
    score,
  };
}

async function checkSSL(url: string): Promise<AuditCheckResult> {
  try {
    const urlObj = new URL(url);
    const enabled = urlObj.protocol === "https:";
    const score = enabled ? 100 : 0;

    return {
      enabled,
      score,
    };
  } catch {
    return {
      enabled: false,
      score: 0,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !validateUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    let html = "";
    try {
      const response = await fetchWithTimeout(url);
      html = await response.text();
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch the URL. Please check if the URL is accessible." },
        { status: 400 }
      );
    }

    const [meta, headings, images, links, mobile, ssl] = await Promise.all([
      checkMetaTags(html),
      checkHeadings(html),
      checkImages(html),
      checkLinks(html, url),
      checkMobileFriendly(html),
      checkSSL(url),
    ]);

    const results = { meta, headings, images, links, mobile, ssl };

    const weights = {
      meta: 0.2,
      headings: 0.15,
      images: 0.15,
      links: 0.2,
      mobile: 0.15,
      ssl: 0.15,
    };

    const score = Math.round(
      meta.score * weights.meta +
      headings.score * weights.headings +
      images.score * weights.images +
      links.score * weights.links +
      mobile.score * weights.mobile +
      ssl.score * weights.ssl
    );

    return NextResponse.json({
      url,
      score,
      results,
    });
  } catch {
    console.error("Audit error:");
    return NextResponse.json(
      { error: "Failed to analyze the website" },
      { status: 500 }
    );
  }
}
