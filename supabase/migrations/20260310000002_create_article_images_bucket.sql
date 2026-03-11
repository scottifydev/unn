-- Create article-images storage bucket for AI-generated featured images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Public read access
create policy "article_images_public_read"
on storage.objects for select
using (bucket_id = 'article-images');

-- Service role can insert
create policy "article_images_service_insert"
on storage.objects for insert
with check (bucket_id = 'article-images');

-- Service role can update
create policy "article_images_service_update"
on storage.objects for update
using (bucket_id = 'article-images');
