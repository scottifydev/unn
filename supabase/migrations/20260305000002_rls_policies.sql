-- UNN Row Level Security Policies
-- Four role levels: anonymous, contributor, editor, admin

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table sections enable row level security;
alter table articles enable row level security;
alter table ticker_items enable row level security;
alter table council_advisories enable row level security;
alter table ads enable row level security;
alter table trending enable row level security;

-- Helper: get current user's role
create or replace function public.get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Helper: check minimum role level
create or replace function public.has_role(required user_role)
returns boolean as $$
  select case required
    when 'reader' then true
    when 'contributor' then public.get_user_role() in ('contributor', 'editor', 'admin')
    when 'editor' then public.get_user_role() in ('editor', 'admin')
    when 'admin' then public.get_user_role() = 'admin'
    else false
  end
$$ language sql security definer stable;

-- PROFILES
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- SECTIONS
create policy "Sections are viewable by everyone"
  on sections for select using (true);

create policy "Admins can manage sections"
  on sections for all using (public.has_role('admin'));

-- ARTICLES
create policy "Published articles are viewable by everyone"
  on articles for select using (status = 'published');

create policy "Authors can view own articles"
  on articles for select using (auth.uid() = author_id);

create policy "Editors can view all articles"
  on articles for select using (public.has_role('editor'));

create policy "Contributors can insert articles"
  on articles for insert with check (
    public.has_role('contributor')
    and auth.uid() = author_id
  );

create policy "Authors can update own drafts"
  on articles for update using (
    auth.uid() = author_id
    and status in ('draft', 'pending')
  );

create policy "Editors can update any article"
  on articles for update using (public.has_role('editor'));

create policy "Authors can delete own drafts"
  on articles for delete using (
    auth.uid() = author_id
    and status = 'draft'
  );

create policy "Admins can delete any article"
  on articles for delete using (public.has_role('admin'));

-- TICKER ITEMS
create policy "Active ticker items are viewable by everyone"
  on ticker_items for select using (active = true);

create policy "Editors can manage ticker items"
  on ticker_items for all using (public.has_role('editor'));

-- COUNCIL ADVISORIES
create policy "Active advisories are viewable by everyone"
  on council_advisories for select using (active = true);

create policy "Editors can manage advisories"
  on council_advisories for all using (public.has_role('editor'));

-- ADS
create policy "Active ads are viewable by everyone"
  on ads for select using (active = true);

create policy "Editors can manage ads"
  on ads for all using (public.has_role('editor'));

-- TRENDING
create policy "Active trending items are viewable by everyone"
  on trending for select using (active = true);

create policy "Editors can manage trending"
  on trending for all using (public.has_role('editor'));
