-- Delete existing channels (optional)
DELETE FROM "channels";

-- Insert channels matching the design
INSERT INTO "channels" (id, name, slug, description, "is_public", "createdAt") VALUES
  (gen_random_uuid(), 'Tivoli General', 'tivoli-general', 'General campus discussions and activities', true, now()),
  (gen_random_uuid(), 'Zwickau International', 'zwickau-international', 'International students community', true, now()),
  (gen_random_uuid(), 'MIT Class 2A', 'mit-class-2a', 'MIT Class 2A discussions and study groups', true, now()),
  (gen_random_uuid(), 'Campus Events', 'campus-events', 'Official campus events and announcements', false, now()),
  (gen_random_uuid(), 'Study Group - AI', 'study-group-ai', 'AI and Machine Learning study group', true, now());
