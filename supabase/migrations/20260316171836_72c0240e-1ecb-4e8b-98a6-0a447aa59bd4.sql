-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Founder Pages
CREATE TABLE public.founder_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  founder_name TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  profile_image_url TEXT,
  build_score INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  verified_founder BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page Revisions
CREATE TABLE public.page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_content TEXT NOT NULL DEFAULT '',
  new_content TEXT NOT NULL DEFAULT '',
  edited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Launches
CREATE TABLE public.product_launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  launch_date DATE,
  description TEXT,
  product_url TEXT
);

-- Milestones
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  type TEXT DEFAULT 'milestone'
);

-- Page Views
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  device_type TEXT,
  country TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Startups
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  founded_year INTEGER,
  website TEXT
);

-- Founder-Startups junction
CREATE TABLE public.founder_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  role TEXT
);

-- Cofounders
CREATE TABLE public.cofounders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  related_founder_id UUID REFERENCES public.founder_pages(id) ON DELETE SET NULL,
  startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL
);

-- Page Claims
CREATE TABLE public.page_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.founder_pages(id) ON DELETE CASCADE,
  claimer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_method TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cofounders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_claims ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS: User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Founder Pages (public read, auth write)
CREATE POLICY "Founder pages are viewable by everyone" ON public.founder_pages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create pages" ON public.founder_pages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
CREATE POLICY "Authenticated users can update pages" ON public.founder_pages FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS: Page Revisions
CREATE POLICY "Revisions are viewable by everyone" ON public.page_revisions FOR SELECT USING (true);
CREATE POLICY "Auth users can create revisions" ON public.page_revisions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = edited_by);

-- RLS: Product Launches
CREATE POLICY "Product launches are viewable by everyone" ON public.product_launches FOR SELECT USING (true);
CREATE POLICY "Auth users can manage product launches" ON public.product_launches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update product launches" ON public.product_launches FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete product launches" ON public.product_launches FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS: Milestones
CREATE POLICY "Milestones are viewable by everyone" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Auth users can manage milestones" ON public.milestones FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update milestones" ON public.milestones FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete milestones" ON public.milestones FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS: Page Views
CREATE POLICY "Page views are viewable by everyone" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);

-- RLS: Startups
CREATE POLICY "Startups are viewable by everyone" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Auth users can manage startups" ON public.startups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update startups" ON public.startups FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS: Founder Startups
CREATE POLICY "Founder startups are viewable by everyone" ON public.founder_startups FOR SELECT USING (true);
CREATE POLICY "Auth users can manage founder startups" ON public.founder_startups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS: Cofounders
CREATE POLICY "Cofounders are viewable by everyone" ON public.cofounders FOR SELECT USING (true);
CREATE POLICY "Auth users can manage cofounders" ON public.cofounders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS: Page Claims
CREATE POLICY "Users can view own claims" ON public.page_claims FOR SELECT USING (auth.uid() = claimer_user_id);
CREATE POLICY "Users can create claims" ON public.page_claims FOR INSERT WITH CHECK (auth.uid() = claimer_user_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(page_id_param UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.founder_pages SET view_count = view_count + 1 WHERE id = page_id_param;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_founder_pages_updated_at
BEFORE UPDATE ON public.founder_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();