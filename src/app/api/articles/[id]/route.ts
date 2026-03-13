import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Article, ArticleWithSectionAndAuthor } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import {
  updateArticleSchema,
  hasMinRole,
  slugify,
  sanitizeHtml,
} from "@/lib/validators/article";

type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const article = data as unknown as ArticleWithSectionAndAuthor;

  if (article.status === "published") {
    return NextResponse.json({ data: article });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  const isAuthor = article.author_id === user.id;
  const isEditor = role ? hasMinRole(role, "editor") : false;

  if (!isAuthor && !isEditor) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ data: article });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: articleData, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !articleData) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const article = articleData as unknown as Article;
  const isAuthor = article.author_id === user.id;
  const isEditor = hasMinRole(role, "editor");

  if (!isAuthor && !isEditor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = updateArticleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    );
  }

  const updates = result.data;

  if (updates.status && updates.status !== article.status) {
    if (
      (updates.status === "published" || updates.status === "archived") &&
      !isEditor
    ) {
      return NextResponse.json(
        { error: "Only editors can publish or archive articles" },
        { status: 403 }
      );
    }
  }

  if (isAuthor && !isEditor && article.status !== "draft") {
    return NextResponse.json(
      { error: "Authors can only edit their own drafts" },
      { status: 403 }
    );
  }

  const updateData: ArticleUpdate = {};

  if (updates.headline !== undefined) {
    updateData.headline = updates.headline;
    updateData.slug = slugify(updates.headline) + "-" + Date.now().toString(36);
  }
  if (updates.dek !== undefined) updateData.dek = updates.dek;
  if (updates.body_json !== undefined) {
    updateData.body_json = updates.body_json as ArticleUpdate["body_json"];
  }
  if (updates.body_html !== undefined) {
    updateData.body_html = sanitizeHtml(updates.body_html);
  }
  if (updates.section_id !== undefined) updateData.section_id = updates.section_id;
  if (updates.featured !== undefined) {
    updateData.featured = updates.featured;
  }
  if (updates.sort_order !== undefined) {
    updateData.sort_order = updates.sort_order ?? null;
  }
  if (updates.featured_image_url !== undefined) {
    updateData.featured_image_url = updates.featured_image_url ?? null;
  }
  if (updates.featured_image_alt !== undefined) {
    updateData.featured_image_alt = updates.featured_image_alt ?? null;
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status;
    if (updates.status === "published" && !article.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ data: article });
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id)
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data as unknown as ArticleWithSectionAndAuthor,
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: articleData, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !articleData) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const article = articleData as unknown as Article;
  const isAuthor = article.author_id === user.id;
  const isAdmin = hasMinRole(role, "admin");

  if (isAuthor && article.status === "draft") {
    // authors can delete own drafts
  } else if (isAdmin) {
    // admins can delete anything
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
