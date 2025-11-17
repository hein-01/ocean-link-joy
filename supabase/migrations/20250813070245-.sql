-- Update the user_role enum to have only 'user' role
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('user');

-- Update the profiles table to use the new enum
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING 'user'::user_role;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user'::user_role;

-- Drop the old enum
DROP TYPE user_role_old;

-- Update existing profiles to have 'user' role
UPDATE profiles SET role = 'user' WHERE role IS NOT NULL;