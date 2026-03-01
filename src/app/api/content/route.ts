import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { groqApiKey } from "@/config/firebase";

const groq = new Groq({ apiKey: groqApiKey });

const contentTypePrompts: Record<string, string> = {
  "blog-post": "Write a comprehensive blog post",
  "product-description": "Write a compelling product description",
  "landing-page": "Write persuasive landing page copy",
  "social-media": "Write engaging social media content",
  "email-newsletter": "Write an email newsletter",
  "faq": "Write FAQ content",
};

const tonePrompts: Record<string, string> = {
  professional: "in a professional and formal tone",
  casual: "in a casual and friendly tone",
  friendly: "in a warm and friendly tone",
  authoritative: "in an authoritative and expert tone",
  humorous: "in a humorous and entertaining tone",
};

const lengthGuidance: Record<string, string> = {
  short: "Keep it brief, around 100-150 words.",
  medium: "Write a moderate length piece, around 300-400 words.",
  long: "Write comprehensive content, around 600-800 words.",
};

export async function POST(request: NextRequest) {
  try {
    const { topic, contentType, tone, length } = await request.json();

    if (!topic || !contentType || !tone || !length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured. Please add GROQ_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const contentTypePrompt = contentTypePrompts[contentType] || "Write content";
    const tonePrompt = tonePrompts[tone] || "";
    const lengthGuidanceStr = lengthGuidance[length] || "";

    const prompt = `${contentTypePrompt} ${tonePrompt} about "${topic}". ${lengthGuidanceStr}

Requirements:
- Use proper headings and structure
- Make it SEO-friendly with relevant keywords naturally incorporated
- Include a compelling introduction and conclusion
- Use bullet points where appropriate for readability
- Ensure the content is engaging and valuable to readers`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert SEO content writer. Generate high-quality, SEO-optimized content that engages readers and ranks well in search engines. Always output well-formatted content with proper structure.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: length === "long" ? 2000 : length === "medium" ? 1000 : 500,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: generatedContent,
      wordCount: generatedContent.split(/\s+/).length,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
