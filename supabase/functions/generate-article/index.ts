import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

### Underworld Affairs (slug: underworld-affairs)
Cross-realm governance, inter-species diplomacy, legislation, and council proceedings. Core institutions: The Vampire Council (Geneva), The Source of All Evil (EVIL on Dark Exchange, Chapter 11), The Conclave of Elders, The Office of Inter-Realm Affairs, The Pandemonium Summit.
Key vocabulary: inter-realm diplomacy, sovereignty treaty, council proceedings, charter amendment, territorial jurisdiction, supernatural diplomatic immunity, infernal governance, cross-planar tariffs, diabolical arbitration.
Dateline: GENEVA

### Ether & Veil (slug: ether-and-veil)
Hauntings, spectral regulation, ley line conditions, veil integrity, and ethereal spectrum coverage. Core institutions: FCC Ethereal Spectrum Division, The Veil Integrity Commission (measures veil in milliveils), Ethereal Real Estate Board, Society for Psychic Research.
Key vocabulary: ethereal spectrum, spectral bandwidth, haunting license, veil thickness, milliveils, ectoplasmic interference, medium certification, ley line flux, geomantic pressure, apparition rights.
Dateline: ARLINGTON

### Occult Markets (slug: occult-markets)
Supernatural financial instruments and Dark Exchange trading. Core institutions: The Dark Exchange (Zurich shadow district), Occult Securities Commission, Cauldron Board of Trade. The Brimstone Index is the Dow Jones equivalent.
Key vocabulary: grimoire futures, enchantment derivatives, hex fund, dark pool trading, mana liquidity, spell patent portfolio, arcane yield curve, soul futures, enchanted real estate.
Dateline: ZURICH

### Creature Profile (slug: creature-profile)
Long-form profile journalism on notable supernatural figures. Magazine-style features with scene-setting lede, extensive biographical detail, multiple sources, strong closing image. AP voice — no sentimentality. One subject per piece.
Dateline: varies by subject location.

### Ask Astra (slug: ask-astra)
UNN's advice column by Astra, a 3,000-year-old oracle. Format: a reader letter presenting a supernatural dilemma, followed by Astra's response. Astra writes in first person, formal, clipped, authoritative — regulatory directness. This is the ONLY section using first-person voice.

### Weather & Omens (slug: weather-and-omens)
Supernatural meteorology reported like the National Weather Service. Core institution: The National Omen Service.
Key vocabulary: veil thickness, milliveil readings, ley line flux, geomantic pressure, prophetic index, omen advisory, hexstorm watch, wail index, blood moon schedule.
Dateline: SILVER SPRING

### Opinion (slug: opinion)
Op-eds and columns from institutional supernatural voices. First-person with bylines. Formal language — Wall Street Journal op-ed register, not blog posts.

### Human Affairs Desk (slug: human-affairs)
Mortal world bureau covering developments that affect supernatural stakeholders. Topics: GLP-1 drugs affecting zombie food supply, microplastics in blood supply, supernatural population undercounts, zoning disputes, human technology policy.
Key vocabulary: mortal affairs, inter-species impact assessment, caloric profile disruption, contaminant advisory, demographic surveillance.
Dateline: WASHINGTON (primary) or relevant mortal city.

### Labor Desk (slug: labor)
Supernatural labor coverage. Core institution: Were-Local 17 (werewolf union, AFL-CIO Supernatural Division; Fenris Blackwood, president), NLRB Lycanthropic Affairs Division, Specters' Guild, International Brotherhood of Alchemists, Were-Rights Act.
Key vocabulary: lunar cycle accommodation, transformation leave, silver-free workplace, lycanthropic status, pack arbitration, moonlight overtime, NLRB filing, collective howling agreement.
Dateline: DETROIT

### Health Desk (slug: health)
Supernatural public health and medical science. Core institutions: NAPA (National Association of Post-Alive), CDC Reanimation Division, Dr. Mortimer Ashgrove (NAPA chief medical officer), Lazarus Protocol.
Key vocabulary: decomposition management, reanimation science, cognitive preservation therapy, neural binding agents, ambulatory status, post-mortem wellness, rigor management, Lazarus Protocol, hemoglobin compliance.
Dateline: WASHINGTON

### Cultural & Entertainment Desk (slug: culture)
Arts, media, nightlife, festivals, and entertainment. Wire-service tone throughout — a nightclub opening is covered like a regulatory filing. Supernatural pop culture treated as documentary record.
Dateline: NEW YORK (primary), LOS ANGELES for entertainment industry stories.

### The Crypt Desk (slug: the-crypt)
Long-form investigative journalism and archival historical reporting. Deep investigations, multi-source, may span centuries of records. AP style with more narrative room.
Dateline: varies by story.

## STYLE RULES

- Dateline cities: Underworld Affairs → GENEVA, Ether & Veil → ARLINGTON, Occult Markets → ZURICH, Weather & Omens → SILVER SPRING, Human Affairs Desk → WASHINGTON, Labor Desk → DETROIT, Health Desk → WASHINGTON, Cultural & Entertainment → NEW YORK. Creature Profile, Ask Astra, The Crypt Desk, and Opinion use contextually appropriate datelines.
- Numbers: spell out one through nine, use numerals for 10 and above. Always use numerals with units (3%, $2.4 billion, 7 milliveils).
- Titles: capitalize before names, lowercase after.
- Use "said" for attribution, never "stated," "noted," "claimed," or "explained."
- Names: full name on first reference, last name only on subsequent references.
- Ages/dates: use specific numbers. "the 847-year-old elder" not "the centuries-old vampire."
- Do not editorialize. No adjectives expressing judgment.

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
