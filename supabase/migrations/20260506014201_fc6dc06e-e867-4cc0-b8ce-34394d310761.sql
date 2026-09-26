-- Add granted_at to user_roles for premium expiry tracking
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Function to check if user has an active (non-expired) role
-- Premium roles expire after 30 days; admin/teacher/student never expire
CREATE OR REPLACE FUNCTION public.has_active_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _role <> 'premium'
        OR granted_at > now() - INTERVAL '30 days'
      )
  )
$$;