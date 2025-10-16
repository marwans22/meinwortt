-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for petition status
CREATE TYPE public.petition_status AS ENUM ('draft', 'pending', 'published', 'closed', 'rejected');

-- Create enum for signature verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'expired');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Petitions table
CREATE TABLE public.petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal INTEGER NOT NULL DEFAULT 100,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status petition_status NOT NULL DEFAULT 'draft',
  category TEXT,
  image_url TEXT,
  target_institution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published petitions"
  ON public.petitions FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view own petitions"
  ON public.petitions FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create petitions"
  ON public.petitions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own drafts"
  ON public.petitions FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'draft');

CREATE POLICY "Admins can update any petition"
  ON public.petitions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Signatures table
CREATE TABLE public.signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID REFERENCES public.petitions(id) ON DELETE CASCADE NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  comment TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_token UUID DEFAULT gen_random_uuid(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  UNIQUE(petition_id, signer_email)
);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified signatures"
  ON public.signatures FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Anyone can create signatures"
  ON public.signatures FOR INSERT
  WITH CHECK (true);

-- Petition comments table
CREATE TABLE public.petition_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id UUID REFERENCES public.petitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.petition_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on published petitions"
  ON public.petition_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.petitions
      WHERE id = petition_id AND status = 'published'
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON public.petition_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.petition_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.petition_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  petition_id UUID REFERENCES public.petitions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.petition_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CHECK (petition_id IS NOT NULL OR comment_id IS NOT NULL)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can view reports"
  ON public.reports FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_petitions_updated_at
  BEFORE UPDATE ON public.petitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.petition_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_petitions_status ON public.petitions(status);
CREATE INDEX idx_petitions_creator ON public.petitions(creator_id);
CREATE INDEX idx_petitions_created ON public.petitions(created_at DESC);
CREATE INDEX idx_signatures_petition ON public.signatures(petition_id);
CREATE INDEX idx_signatures_status ON public.signatures(verification_status);
CREATE INDEX idx_comments_petition ON public.petition_comments(petition_id);
CREATE INDEX idx_reports_status ON public.reports(status);