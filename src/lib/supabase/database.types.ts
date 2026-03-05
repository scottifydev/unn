export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "reader" | "contributor" | "editor" | "admin";
export type ArticleType = "user" | "ai";
export type ArticleStatus = "draft" | "pending" | "published" | "archived";
export type AdvisoryLevel = 1 | 2 | 3;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: UserRole;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          tag_color: string;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          tag_color: string;
          sort_order: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          tag_color?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          headline: string;
          slug: string;
          dek: string | null;
          body_json: Json | null;
          body_html: string | null;
          section_id: string;
          author_id: string;
          article_type: ArticleType;
          status: ArticleStatus;
          featured: boolean;
          featured_image_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          slug: string;
          dek?: string | null;
          body_json?: Json | null;
          body_html?: string | null;
          section_id: string;
          author_id: string;
          article_type?: ArticleType;
          status?: ArticleStatus;
          featured?: boolean;
          featured_image_url?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          headline?: string;
          slug?: string;
          dek?: string | null;
          body_json?: Json | null;
          body_html?: string | null;
          section_id?: string;
          author_id?: string;
          article_type?: ArticleType;
          status?: ArticleStatus;
          featured?: boolean;
          featured_image_url?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticker_items: {
        Row: {
          id: string;
          text: string;
          priority: number;
          active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          priority?: number;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          priority?: number;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      council_advisories: {
        Row: {
          id: string;
          level: number;
          title: string;
          body: string;
          active: boolean;
          issued_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: number;
          title: string;
          body: string;
          active?: boolean;
          issued_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: number;
          title?: string;
          body?: string;
          active?: boolean;
          issued_at?: string;
          created_at?: string;
        };
      };
      ads: {
        Row: {
          id: string;
          advertiser: string;
          headline: string;
          body: string;
          tagline: string | null;
          cta_text: string;
          cta_url: string;
          image_url: string | null;
          placement: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          advertiser: string;
          headline: string;
          body: string;
          tagline?: string | null;
          cta_text: string;
          cta_url: string;
          image_url?: string | null;
          placement: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          advertiser?: string;
          headline?: string;
          body?: string;
          tagline?: string | null;
          cta_text?: string;
          cta_url?: string;
          image_url?: string | null;
          placement?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      trending: {
        Row: {
          id: string;
          headline: string;
          article_id: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          article_id?: string | null;
          sort_order: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          headline?: string;
          article_id?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      article_type: ArticleType;
      article_status: ArticleStatus;
    };
  };
}
