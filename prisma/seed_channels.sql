-- Seed default channels for social wall
INSERT INTO "channels" (id, name, slug, description, "is_public", "createdAt") VALUES
  (gen_random_uuid(), 'General', 'general', 'General campus discussions', true, NOW()),
  (gen_random_uuid(), 'Announcements', 'announcements', 'Official campus announcements', true, NOW()),
  (gen_random_uuid(), 'Study Group', 'study-group', 'Find study partners', true, NOW()),
  (gen_random_uuid(), 'Jobs & Internships', 'jobs', 'Job postings and opportunities', true, NOW()),
  (gen_random_uuid(), 'Events', 'events', 'Campus events and activities', true, NOW());
