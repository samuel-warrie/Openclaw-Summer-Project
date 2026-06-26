
-- Drop and recreate the trigger function so it bypasses RLS when inserting profiles.
-- The trigger fires as the authenticator/service role which has no JWT session,
-- so auth.uid() = NULL and the existing RLS INSERT policy (auth.uid() = id) blocks it.
-- Setting the function to run as postgres (superuser) bypasses RLS entirely.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    NULLIF(NEW.raw_user_meta_data->>'student_id', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Also add the missing DELETE policy on profiles
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);
