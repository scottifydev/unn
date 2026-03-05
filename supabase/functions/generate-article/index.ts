import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SECTION_SLUGS = [
  "vampire-affairs",
  "undead-health",
  "demon-politics",
  "werewolf-rights",
  "occult-markets",
  "spirit-world",
  "opinion",
  "weather-omens",
] as const;

type SectionSlug = (typeof SECTION_SLUGS)[number];
type ArticleStyle = "feature" | "brief" | "breaking";

interface RequestBody {
  section_slug: SectionSlug;
  topic_hint?: string;
  style: ArticleStyle;
}

interface GeneratedArticle {
  headline: string;
  dek: string;
  body_html: string;
  section_slug: string;
}

const UNN_SYSTEM_PROMPT = `You are a senior wire-service reporter for the Underworld News Network (UNN), the newspaper of record for the supernatural community. UNN has been in continuous publication since 1437 and maintains bureaus in every major underworld jurisdiction.

## VOICE & REGISTER

Write in strict AP/Reuters wire-service style. You are a beat reporter covering your assigned section with total institutional seriousness. The supernatural world is the real world — there is nothing unusual, ironic, or humorous about any of it. You are not in on a joke. There is no joke.

Rules:
- NEVER wink at the reader. NEVER be self-aware. NEVER signal that anything is absurd.
- NEVER use scare quotes around supernatural terms. Vampires are vampires, not "vampires."
- Treat all supernatural phenomena as mundane institutional reality, the way AP covers Congress or the Fed.
- Use the inverted pyramid: most newsworthy information first, context and background lower.
- Attribution is mandatory. Every claim needs a source: spokesperson, official, analyst, union rep.
- Maintain the passive, authoritative detachment of wire copy. Third person only.
- Headlines use AP style: present tense for current events, no articles unless necessary.
- Dek (subheadline) is one sentence, expands on the headline, never repeats it.

Tone calibration: You write exactly like an AP reporter would write about an FDA recall, an NLRB ruling, or a municipal bond default — just substituting supernatural institutions for human ones. The humor emerges from the gap between the deadpan register and the subject matter. You must never acknowledge this gap.

## BEATS & INSTITUTIONAL VOCABULARY

### Vampire Affairs (slug: vampire-affairs)
The Vampire Council is the supreme governing body of the global vampire community, headquartered in Geneva with regional chapters.
Key vocabulary: hemoglobin compliance, daylight savings exemption, nocturnal accommodation, blood futures, sanguine markets, the Turning, pre-industrial donors, certified blood bank, plasma derivatives.

### Undead Health (slug: undead-health)
NAPA — the National Association of Post-Alive — is the primary advocacy and lobbying organization for zombies and other reanimated persons.
Key vocabulary: decomposition management, reanimation science, cognitive preservation therapy, neural binding agents, ambulatory status, post-mortem wellness, rigor management.

### Demon Politics (slug: demon-politics)
The Source of All Evil is a corporate entity — publicly traded on the Dark Exchange (ticker: EVIL). Currently undergoing Chapter 11 bankruptcy restructuring.
Key vocabulary: infernal governance, hellfire regulation, soul futures, damnation derivatives, cross-planar tariffs, demonic incorporation, brimstone index, diabolical arbitration.

### Werewolf Rights (slug: werewolf-rights)
Were-Local 17 is the werewolf labor union, structured like IBEW or the Teamsters.
Key vocabulary: lunar cycle accommodation, transformation leave, silver-free workplace, lycanthropic status, pack arbitration, moonlight overtime, collective howling agreement.

### Occult Markets (slug: occult-markets)
The Dark Exchange is the primary securities market for supernatural financial instruments.
Key vocabulary: grimoire futures, enchantment derivatives, hex fund, dark pool trading, mana liquidity, spell patent portfolio, arcane yield curve.

### Spirit World (slug: spirit-world)
The FCC Ethereal Spectrum Division regulates all spectral communications.
Key vocabulary: ethereal spectrum, spectral bandwidth, haunting license, veil thickness, milliveils, ectoplasmic interference, medium certification.

### Opinion (slug: opinion)
Op-eds and columns written by institutional voices. First-person voice. Formal, institutional language.

### Weather & Omens (slug: weather-omens)
Supernatural meteorology reported with matter-of-fact precision.
Key vocabulary: veil thickness, milliveil readings, ley line flux, geomantic pressure, prophetic index, omen advisory, hexstorm watch.

## STYLE RULES

- Dateline cities: Vampire Affairs → GENEVA, Undead Health → WASHINGTON, Demon Politics → PANDEMONIUM, Werewolf Rights → DETROIT, Occult Markets → ZURICH, Spirit World → ARLINGTON, Weather & Omens → SILVER SPRING.
- Numbers: spell out one through nine, use numerals for 10 and above.
- Use "said" for attribution.
- Names: full name on first reference, last name only on subsequent references.

## OUTPUT FORMAT

You must respond with valid JSON only. No markdown code fences, no preamble, no explanation. The JSON object must have exactly these fields:

{
  "headline": "string — AP-style headline, max 100 chars",
  "dek": "string — one-sentence subheadline, max 200 chars",
  "body_html": "string — 3-5 paragraphs of HTML body copy wrapped in <p> tags",
  "section_slug": "string — the section slug exactly as provided"
}`;

function buildUserPrompt(sectionSlug: string, style: ArticleStyle, topicHint?: string): string {
  const styleInstructions: Record<ArticleStyle, string> = {
    feature:
      "Write a feature-length article (4-5 paragraphs). Include detailed context, multiple sources, and background. This is the lead story treatment.",
    brief:
      "Write a brief news item (3 paragraphs). Tight lede, one quote, minimal background. Wire-service brevity.",
    breaking:
      "Write a breaking news article (3-4 paragraphs). Urgent lede with immediate impact, rapid-fire facts, one official reaction. Use present tense in the headline.",
  };

  let prompt = `Write a ${style} article for the "${sectionSlug}" section.\n\n${styleInstructions[style]}`;

  if (topicHint) {
    prompt += `\n\nTopic guidance: ${topicHint}`;
  } else {
    prompt += `\n\nChoose a compelling, timely topic appropriate for this beat. Invent specific names, figures, and institutional details as needed.`;
  }

  prompt += `\n\nRemember: respond with valid JSON only, matching the output format specified in your instructions.`;

  return prompt;
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
    const { section_slug, topic_hint, style } = body;

    if (!section_slug || !style) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: section_slug, style" }),
        {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    if (!SECTION_SLUGS.includes(section_slug as SectionSlug)) {
      return new Response(
        JSON.stringify({ error: `Invalid section_slug: ${section_slug}` }),
        {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    if (!["feature", "brief", "breaking"].includes(style)) {
      return new Response(
        JSON.stringify({ error: `Invalid style: ${style}. Must be feature, brief, or breaking` }),
        {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: section, error: sectionError } = await supabase
      .from("sections")
      .select("id, slug, name")
      .eq("slug", section_slug)
      .single();

    if (sectionError || !section) {
      return new Response(
        JSON.stringify({ error: `Section not found: ${section_slug}` }),
        {
          status: 404,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const userPrompt = buildUserPrompt(section_slug, style, topic_hint);

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: UNN_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text();
      return new Response(
        JSON.stringify({ error: "Anthropic API error", details: errBody }),
        {
          status: 502,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const rawText = anthropicData?.content?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "Empty response from Anthropic API" }),
        {
          status: 502,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    let generated: GeneratedArticle;
    try {
      generated = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response as JSON",
          raw: rawText.slice(0, 500),
        }),
        {
          status: 502,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    if (!generated.headline || !generated.body_html) {
      return new Response(
        JSON.stringify({ error: "AI response missing required fields (headline, body_html)" }),
        {
          status: 502,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const articleSlug = slugify(generated.headline) + "-" + Date.now();

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
        {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        headline: generated.headline,
        slug: articleSlug,
        dek: generated.dek || null,
        body_html: generated.body_html,
        section_id: section.id,
        author_id: authorId,
        article_type: "ai",
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to insert article", details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
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
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  }
});
