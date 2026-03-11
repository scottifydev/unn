import { z } from "zod";

const ROLE_LEVELS = { reader: 0, contributor: 1, editor: 2, admin: 3 } as const;

export function hasMinRole(userRole: string, requiredRole: string): boolean {
  return (
    (ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] ?? 0) >=
    (ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS] ?? 99)
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
}

export const createArticleSchema = z.object({
  headline: z.string().min(5).max(200),
  dek: z.string().max(500).optional(),
  body_json: z.unknown().optional(),
  body_html: z.string().optional(),
  section_id: z.string().uuid(),
  featured_image_url: z.string().url().optional(),
  featured_image_alt: z.string().max(500).optional(),
});

export const updateArticleSchema = z.object({
  headline: z.string().min(5).max(200).optional(),
  dek: z.string().max(500).optional(),
  body_json: z.unknown().optional(),
  body_html: z.string().optional(),
  section_id: z.string().uuid().optional(),
  featured_image_url: z.string().url().nullable().optional(),
  featured_image_alt: z.string().max(500).nullable().optional(),
  featured: z.boolean().optional(),
  status: z
    .enum(["draft", "pending", "published", "archived"] as const)
    .optional(),
});

export const publishArticleSchema = z.object({
  status: z.literal("published"),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
