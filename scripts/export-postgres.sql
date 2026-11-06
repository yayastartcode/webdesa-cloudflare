-- Read-only snapshot. The output includes password hashes; keep it private.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT jsonb_build_object(
  'users', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM users t),
  'posts', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM posts t),
  'header_settings', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM header_settings t),
  'navigation_items', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM navigation_items t),
  'hero_slides', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM hero_slides t),
  'village_info', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM village_info t),
  'village_head_welcome', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM village_head_welcome t),
  'population_data', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM population_data t),
  'employees', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM employees t),
  'helpdesk', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM helpdesk t),
  'info', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM info t),
  'gallery', (SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) FROM gallery t),
  'apb_desa', (SELECT coalesce(jsonb_agg(to_jsonb(t) || jsonb_build_object('pendapatanDesa', t."pendapatanDesa"::text, 'belanjaDesa', t."belanjaDesa"::text)), '[]'::jsonb) FROM apb_desa t)
);
COMMIT;
