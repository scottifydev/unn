-- UNN Core Tables
-- Creates all database tables, enums, foreign keys, and indexes.

-- Enums
create type user_role as enum ('reader', 'contributor', 'editor', 'admin');
create type article_type as enum ('user', 'ai');
create type article_status as enum ('draft', 'pending', 'published', 'archived');

-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  role user_role not null default 'reader',
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Sections (news beats)
create table sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  tag_color text not null default '#999999',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index sections_slug_idx on sections (slug);

-- Articles
create table articles (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  slug text not null unique,
  dek text,
  body_json jsonb,
  body_html text,
  section_id uuid not null references sections (id),
  author_id uuid not null references profiles (id),
  article_type article_type not null default 'user',
  status article_status not null default 'draft',
  featured boolean not null default false,
  featured_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_slug_idx on articles (slug);
create index articles_section_status_idx on articles (section_id, status, published_at desc);
create index articles_author_idx on articles (author_id);
create index articles_status_published_idx on articles (status, published_at desc);

-- Ticker items (breaking news bar)
create table ticker_items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  priority int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Vampire Council Advisories
create table council_advisories (
  id uuid primary key default gen_random_uuid(),
  level int not null check (level between 1 and 3),
  title text not null,
  body text not null,
  active boolean not null default true,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Fictional ad units
create table ads (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  headline text not null,
  body text not null,
  tagline text,
  cta_text text not null,
  cta_url text not null,
  image_url text,
  placement text not null default 'sidebar',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Trending sidebar items
create table trending (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  article_id uuid references articles (id) on delete set null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index trending_sort_idx on trending (sort_order asc);

-- Updated_at trigger for articles
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();
