INSERT INTO roles (name) VALUES ('buyer'), ('seller')
ON CONFLICT DO NOTHING;
