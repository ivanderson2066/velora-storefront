CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DO $$
DECLARE policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('products', 'orders', 'user_roles')
      AND (coalesce(qual, '') LIKE '%has_role%' OR coalesce(with_check, '') LIKE '%has_role%')
  LOOP
    EXECUTE format('ALTER POLICY %I ON %I.%I%s%s',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename,
      CASE WHEN policy_record.qual IS NOT NULL THEN ' USING (' || replace(policy_record.qual, 'has_role(', 'private.has_role(') || ')' ELSE '' END,
      CASE WHEN policy_record.with_check IS NOT NULL THEN ' WITH CHECK (' || replace(policy_record.with_check, 'has_role(', 'private.has_role(') || ')' ELSE '' END
    );
  END LOOP;
END $$;

DO $$
DECLARE policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (coalesce(qual, '') LIKE '%has_role%' OR coalesce(with_check, '') LIKE '%has_role%')
  LOOP
    EXECUTE format('ALTER POLICY %I ON %I.%I%s%s',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename,
      CASE WHEN policy_record.qual IS NOT NULL THEN ' USING (' || replace(policy_record.qual, 'has_role(', 'private.has_role(') || ')' ELSE '' END,
      CASE WHEN policy_record.with_check IS NOT NULL THEN ' WITH CHECK (' || replace(policy_record.with_check, 'has_role(', 'private.has_role(') || ')' ELSE '' END
    );
  END LOOP;
END $$;

DROP FUNCTION public.has_role(uuid, public.app_role);