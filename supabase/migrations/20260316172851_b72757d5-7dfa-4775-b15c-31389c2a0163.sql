
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

-- Founder badges table
CREATE TABLE public.founder_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.founder_pages(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  badge_label text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone" ON public.founder_badges FOR SELECT USING (true);
CREATE POLICY "Auth users can award badges" ON public.founder_badges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Founder metrics table for revenue, customers, etc.
CREATE TABLE public.founder_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.founder_pages(id) ON DELETE CASCADE NOT NULL,
  metric_name text NOT NULL,
  metric_value text NOT NULL,
  metric_type text DEFAULT 'number',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Metrics are viewable by everyone" ON public.founder_metrics FOR SELECT USING (true);
CREATE POLICY "Auth users can manage metrics" ON public.founder_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update metrics" ON public.founder_metrics FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete metrics" ON public.founder_metrics FOR DELETE USING (auth.uid() IS NOT NULL);
