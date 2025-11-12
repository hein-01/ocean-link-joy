-- Clean up orphaned admin users that no longer exist in auth.users
DELETE FROM admin_users 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Create an admin user account
-- Replace 'admin@example.com' with your desired admin email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated', 
  'admin@yourdomain.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  now(),
  '{"is_admin": "true", "admin_role": "super_admin"}',
  now(),
  now(),
  '',
  ''
);