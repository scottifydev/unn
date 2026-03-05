import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import {
  createArticleSchema,
  hasMinRole,
  slugify,
  sanitizeHtml,
} from "@/lib/validators/article";

type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const section = searchParams.get("section");
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*, sections(*), profiles(id, display_name, avatar_url)", {
      count: "exact",
    })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (section) {
    query = query.eq("sections.slug", section);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles = data as unknown as ArticleWithSectionAndAuthor[];

  const filtered = section
    ? articles.filter((a) => a.sections !== null)
    : articles;

  return NextResponse.json({
    data: filtered,
    pagination: {
      page,
      limit,
      total: section ? filtered.length : (count ?? 0),
      totalPages: Math.ceil((section ? filtered.length : (count ?? 0)) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  if (!role || !hasMinRole(role, "contributor")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = createArticleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    );
  }

  const { headline, dek, body_json, body_html, section_id, featured_image_url } =
    result.data;

  const slug = slugify(headline) + "-" + Date.now().toString(36);

  const insertData: ArticleInsert = {
    headline,
    slug,
    dek: dek ?? null,
    body_json: (body_json as ArticleInsert["body_json"]) ?? null,
    body_html: body_html ? sanitizeHtml(body_html) : null,
    section_id,
    author_id: user.id,
    featured_image_url: featured_image_url ?? null,
    status: "draft",
    article_type: "user",
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(insertData)
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: data as unknown as ArticleWithSectionAndAuthor },
    { status: 201 }
  );
}
