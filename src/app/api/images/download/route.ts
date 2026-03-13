import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const imageRes = await fetch(body.url);
  if (!imageRes.ok) {
    return NextResponse.json({ error: "Failed to fetch image from source" }, { status: 502 });
  }

  const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const filename = `${Date.now()}-pexels.${ext}`;

  const arrayBuffer = await imageRes.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(filename, buffer, { contentType, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("article-images")
    .getPublicUrl(filename);

  return NextResponse.json({
    image_url: publicUrl,
    alt: typeof body.alt === "string" ? body.alt : "",
  });
}
