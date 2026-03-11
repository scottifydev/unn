import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "https://esm.sh/jose@5.2.0";

interface RequestBody {
  headline: string;
  section_name: string;
  custom_prompt?: string; // if provided, skips Gemini brief and goes straight to Imagen
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

// Section-specific photographic contexts — what kind of scene fits each beat
const SECTION_VISUAL_CONTEXTS: Record<string, string> = {
  "Underworld Affairs": "Underground government corridors, ministerial stone offices, vaulted bureaucratic chambers with filing cabinets, parliamentary underground halls",
  "Ether & Veil": "Misty river landscapes, derelict observatories, rooms with antique scientific instruments, atmospheric doorways, dusk shorelines",
  "Occult Markets": "Trading floor pits, commodity exchange halls, outdoor market stalls photographed like a produce market, auction room interiors, financial district architecture",
  "Creature Profile": "Intimate documentary portrait. Close-cropped. Direct gaze or three-quarter turn. Neutral or minimal background. Richard Avedon register.",
  "Ask Astra": "Night sky from a coastal cliff, observatory dome exterior, antique almanac pages as still life, quiet reading room at night",
  "Weather & Omens": "Storm-lit landscape, barometric weather station, meteorological charts on a wall, rain-streaked windows, weather balloon launch site",
  "Opinion": "Single figure seen from behind at a window or desk, sparse institutional room, one strong directional light, editorial gravitas",
  "Human Affairs Desk": "City street-level documentary, municipal building exterior, civilian public space, transit hub concourse",
  "Labor Desk": "Industrial workplace, union hall interior, workers in equipment, factory floor, construction scaffold",
  "Health Desk": "Clinical corridor, medical equipment still life, laboratory bench, pharmaceutical documentation",
  "Cultural & Entertainment Desk": "Performance venue mid-show, gallery opening, backstage area, rehearsal room",
  "The Crypt Desk": "Archive room with document boxes, underground preservation vault, archaeological excavation, restoration laboratory",
};

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

function buildBriefPrompt(headline: string, sectionName: string): string {
  const visualContext = SECTION_VISUAL_CONTEXTS[sectionName] ?? "Institutional interior, documentary setting";

  return `You are a photo editor at a serious broadsheet newspaper called the Underworld News Network, which covers supernatural affairs with the same deadpan institutional tone as the Financial Times or Reuters.

Given this headline, write a 2-sentence description of a single specific editorial photograph that would accompany this article. The photograph must be:
- Grounded in the SPECIFIC subject matter of the headline — not generic supernatural imagery
- Photorealistic and journalistic in feel — not illustrated, painted, or fantastical
- Cold, desaturated, near-monochrome, slightly underexposed — Reuters or FT wire photo aesthetic
- NO press conferences unless the headline is specifically about a press conference
- NO skulls, fire, neon, horror aesthetics, Halloween imagery
- The subjects may be supernatural creatures (vampires, werewolves, ghosts, etc.) but they must be shown in realistic, mundane, institutional contexts

Section visual contexts to draw from: ${visualContext}

Headline: "${headline}"

Write only the 2-sentence photograph description. No preamble. No quotes. Just the description.`;
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
    const { headline, section_name, custom_prompt } = body;

    if (!headline || !section_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: headline, section_name" }),
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

    const sa: ServiceAccount = JSON.parse(serviceAccountJson);
    const projectId = sa.project_id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const accessToken = await getAccessToken(sa);

    const vertexBase = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models`;

    // --- Stage 1: Get image brief (custom or AI-generated) ---
    let imageBrief: string;

    if (custom_prompt?.trim()) {
      imageBrief = custom_prompt.trim();
    } else {
      const briefPrompt = buildBriefPrompt(headline, section_name);

      const briefResponse = await fetch(
        `${vertexBase}/gemini-2.0-flash-001:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: briefPrompt }] }],
            generationConfig: { maxOutputTokens: 150, temperature: 1.0 },
          }),
        }
      );

      if (!briefResponse.ok) {
        const errBody = await briefResponse.text();
        return new Response(
          JSON.stringify({ error: "Failed to generate image brief", details: errBody }),
          { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }

      const briefData = await briefResponse.json();
      const generated = briefData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generated) {
        return new Response(
          JSON.stringify({ error: "Empty brief from Gemini" }),
          { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }
      imageBrief = generated;
    }

    // --- Stage 2: Generate image via Imagen 3 ---
    const styleConstraints = "Cold, desaturated documentary photograph. Near-monochrome, film grain, slightly underexposed. Reuters or Financial Times wire photography aesthetic. NO Halloween imagery, no skulls, no fire, no neon, no horror aesthetics.";
    const imagePrompt = custom_prompt?.trim()
      ? `${imageBrief} ${styleConstraints}`
      : `${imageBrief} ${styleConstraints}`;

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
          parameters: { sampleCount: 1, aspectRatio: "4:3" },
        }),
      }
    );

    if (!imageResponse.ok) {
      const errBody = await imageResponse.text();
      return new Response(
        JSON.stringify({ error: "Imagen API error", details: errBody }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const imageData = await imageResponse.json();
    const prediction = imageData?.predictions?.[0];

    if (!prediction?.bytesBase64Encoded) {
      return new Response(
        JSON.stringify({ error: "No image returned from Imagen" }),
        { status: 502, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    // --- Stage 3: Upload to Supabase Storage ---
    const base64Data: string = prediction.bytesBase64Encoded;
    const mimeType: string = prediction.mimeType ?? "image/png";
    const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const imagePath = `${Date.now()}-${slugify(headline)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(imagePath, imageBytes, { contentType: mimeType, upsert: false });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "Failed to upload image", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      );
    }

    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(imagePath);

    return new Response(
      JSON.stringify({ image_url: urlData.publicUrl, brief: imageBrief, used_custom_prompt: !!custom_prompt?.trim() }),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  }
});
