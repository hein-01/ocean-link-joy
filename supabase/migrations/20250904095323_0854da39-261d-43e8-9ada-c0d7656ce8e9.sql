-- Update profiles table to populate email from auth.users
UPDATE public.profiles 
SET email = auth_users.email
FROM auth.users AS auth_users
WHERE profiles.user_id = auth_users.id
AND profiles.email IS NULL;