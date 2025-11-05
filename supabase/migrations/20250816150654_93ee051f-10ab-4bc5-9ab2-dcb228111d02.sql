-- Create the trigger to handle new admin users
DROP TRIGGER IF EXISTS on_auth_admin_user_created ON auth.users;

CREATE TRIGGER on_auth_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- Clean up any potential orphaned auth users that might conflict
DELETE FROM auth.users WHERE raw_user_meta_data ->> 'is_admin' = 'true' AND id NOT IN (SELECT user_id FROM public.admin_users);