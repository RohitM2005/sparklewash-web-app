USE sparklewash;

-- Note: Passwords must be hashed using bcrypt before insertion if done manually.
-- These are example dummy records based on your JS setup Database configuration.

INSERT IGNORE INTO users 
  (name, full_name, email, phone, password, role, status)
VALUES
  ('Ajay Parale', 'Ajay Parale', 'ajayparale9@gmail.com', '9309225001', 'USE_BCRYPT_HASH_HERE', 'admin', 'active'),
  ('SparkleWash Owner', 'SparkleWash Owner', 'sparklewash5001@gmail.com', '9309225001', 'USE_BCRYPT_HASH_HERE', 'admin', 'active'),
  ('Ravi Kumar', 'Ravi Kumar', 'washer1@sparklewash.com', '9000000001', 'USE_BCRYPT_HASH_HERE', 'washer', 'active'),
  ('Suresh Patil', 'Suresh Patil', 'washer2@sparklewash.com', '9000000002', 'USE_BCRYPT_HASH_HERE', 'washer', 'active');
