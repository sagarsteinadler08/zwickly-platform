-- Delete existing channels (optional)
DELETE FROM "channels";

-- Insert 4 specific groups
INSERT INTO "channels" (id, name, slug, description, "is_public", "createdAt") VALUES
  (gen_random_uuid(), 'Tivoli Fun', 'tivoli-fun', 'Fun activities and campus life discussions', true, now()),
  (gen_random_uuid(), 'Zwickau International', 'zwickau-international', 'International students community', true, now()),
  (gen_random_uuid(), 'Random', 'random', 'Random discussions and topics', true, now()),
  (gen_random_uuid(), 'MIT Class', 'mit-class', 'MIT class discussions and study groups', true, now());
