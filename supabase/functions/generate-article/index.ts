import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "https://esm.sh/jose@5.2.0";

const SECTION_SLUGS = [
  "underworld-affairs",
  "ether-and-veil",
  "occult-markets",
  "creature-profile",
  "ask-astra",
  "weather-and-omens",
  "opinion",
  "human-affairs",
  "labor",
  "health",
  "culture",
  "the-crypt",
] as const;

type SectionSlug = (typeof SECTION_SLUGS)[number];
type ArticleStyle = "feature" | "brief" | "breaking";

interface RequestBody {
  section_slug: SectionSlug;
  raw_content: string;
  style: ArticleStyle;
}

interface PolishedArticle {
  headline: string;
  dek: string;
  body_html: string;
  section_slug: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

const UNN_STYLE_RULES = `
UNN AP/Reuters wire-service style rules:
- Deadpan institutional register. The supernatural world is real. Never wink at the reader.
- Inverted pyramid: most newsworthy first.
- Attribution required. Use "said [Name], [Title]" format. Never "stated," "noted," "claimed."
- Headlines: AP-style, present tense, max 100 characters, no articles unless necessary.
- Dek: one sentence, expands on headline without repeating it, max 200 characters.
- Body: wrap paragraphs in <p> tags. Use <strong> for first mention of institutional names.
- Numbers: spell out one through nine, numerals for 10 and above. Always numerals with units.
- Names: full name on first reference, last name only after.
- No editorializing. No adjectives expressing judgment.
`.trim();

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const privateKey = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/cloud-platform",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setIssuer(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Failed to get access token: ${err}`);
  }

  const { access_token } = await resp.json();
  return access_token as string;
}

function buildPolishPrompt(
  sectionSlug: string,
  sectionName: string,
  style: ArticleStyle,
  rawContent: string
): string {
  const styleNote: Record<ArticleStyle, string> = {
    feature: "This is a feature-length piece (4-5 paragraphs). Preserve all detail.",
    brief: "This is a brief wire item (3 paragraphs). Tighten aggressively.",
    breaking: "This is breaking news (3-4 paragraphs). Lead with urgency. Present tense headline.",
  };

  return `You are a copy editor for the Underworld News Network (UNN), the newspaper of record for the supernatural community.

Your job: FORMAT and POLISH the editor's draft — do NOT rewrite or add content. Preserve all facts, quotes, names, and the author's reporting. Only fix grammar, punctuation, attribution format, and style consistency.

${UNN_STYLE_RULES}

Section: ${sectionName} (slug: ${sectionSlug})
Style: ${styleNote[style]}

Editor's draft:
---
${rawContent}
---

Return ONLY valid JSON with exactly these fields:
{
  "headline": "AP-style headline, max 100 chars",
  "dek": "one-sentence subheadline, max 200 chars",
  "body_html": "full article body as HTML paragraphs",
  "section_slug": "${sectionSlug}"
}`;
}

function buildImagePrompt(headline: string, sectionName: string): string {
  return `Editorial photograph for the Underworld News Network (UNN), a serious institutional broadsheet newspaper covering supernatural affairs.

Article headline: ${headline}
Section: ${sectionName}

Visual style: Cold, desaturated documentary photography. Near-monochrome, film grain, slightly underexposed. Financial Times or Reuters wire photography aesthetic applied to supernatural subject matter. Institutional, serious, press-conference or official-proceedings register. The subjects may be supernatural entities — vampires in suits, spectral figures at podiums, creatures in bureaucratic settings — but the photographic treatment must be strictly documentary and journalistic. NO Halloween imagery. NO skulls as decoration. NO fire or dramatic horror lighting. NO neon. NO horror-film aesthetics. This image must look at home in a broadsheet newspaper front page.`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { section_slug, raw_content, style } = body;

    if (!section_slug || !raw_content || !style) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: section_slug, raw_content, style" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    if (!SECTION_SLUGS.includes(section_slug as SectionSlug)) {
      return new Response(
        JSON.stringify({ error: `Invalid section_slug: ${section_slug}` }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    if (!["feature", "brief", "breaking"].includes(style)) {
      return new Response(
        JSON.stringify({ error: `Invalid style: ${style}` }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_SERVICE_ACCOUNT_JSON not configured" }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    let sa: ServiceAccount;
    try {
      sa = JSON.parse(serviceAccountJson);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid GOOGLE_SERVICE_ACCOUNT_JSON" }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const projectId = sa.project_id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("id, slug, name")
      .eq("slug", section_slug)
      .single();

    if (sectionError || !section) {
      return new Response(
        JSON.stringify({ error: `Section not found: ${section_slug}` }),
        { status: 404, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    // --- Get Vertex AI access token ---
    let accessToken: string;
    try {
      accessToken = await getAccessToken(sa);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with Google", details: msg }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const vertexBase = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models`;

    // --- Step 1: Text polish via Vertex AI Gemini 2.0 Flash ---
    const polishPrompt = buildPolishPrompt(section_slug, section.name, style, raw_content);

    const textResponse = await fetch(
      `${vertexBase}/gemini-2.0-flash-001:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: polishPrompt }] }],
        }),
      }
    );

    if (!textResponse.ok) {
      const errBody = await textResponse.text();
      return new Response(
        JSON.stringify({ error: "Vertex AI text API error", details: errBody }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const textData = await textResponse.json();
    const rawText = textData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "Empty response from Vertex AI text API" }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    let polished: PolishedArticle;
    try {
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      polished = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse text response as JSON", raw: rawText.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    if (!polished.headline || !polished.body_html) {
      return new Response(
        JSON.stringify({ error: "Response missing required fields (headline, body_html)" }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    // --- Step 2: Image generation via Vertex AI Imagen 3 (non-fatal) ---
    let featuredImageUrl: string | null = null;
    let featuredImageAlt: string | null = null;

    try {
      const imagePrompt = buildImagePrompt(polished.headline, section.name);
      featuredImageAlt = imagePrompt;

      const imageResponse = await fetch(
        `${vertexBase}/imagen-3.0-generate-001:predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "4:3",
            },
          }),
        }
      );

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const prediction = imageData?.predictions?.[0];

        if (prediction?.bytesBase64Encoded) {
          const base64Data: string = prediction.bytesBase64Encoded;
          const mimeType: string = prediction.mimeType ?? "image/png";
          const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
          const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const imagePath = `${Date.now()}-${slugify(polished.headline)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("article-images")
            .upload(imagePath, imageBytes, { contentType: mimeType, upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("article-images")
              .getPublicUrl(imagePath);
            featuredImageUrl = urlData.publicUrl;
          }
        }
      }
    } catch {
      // Image generation is non-fatal — article saves without image
    }

    // --- Step 3: Resolve author ---
    const authHeader = req.headers.get("authorization");
    let authorId: string | null = null;

    if (authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      authorId = user?.id ?? null;
    }

    if (!authorId) {
      const { data: fallbackProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();
      authorId = fallbackProfile?.id ?? null;
    }

    if (!authorId) {
      return new Response(
        JSON.stringify({ error: "No valid author found. Ensure an admin profile exists." }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    // --- Step 4: Insert article ---
    const articleSlug = slugify(polished.headline) + "-" + Date.now();

    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        headline: polished.headline,
        slug: articleSlug,
        dek: polished.dek || null,
        body_html: polished.body_html,
        section_id: section.id,
        author_id: authorId,
        article_type: "ai",
        status: "pending",
        featured_image_url: featuredImageUrl,
        featured_image_alt: featuredImageUrl ? featuredImageAlt : null,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to insert article", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ article }), {
      status: 201,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  }
});
