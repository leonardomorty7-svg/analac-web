-- Migration: create_noticias_eventos
-- Creates the base tables for News and Events content

CREATE TABLE IF NOT EXISTS public.noticias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  image_alt text NOT NULL,
  date_iso timestamp with time zone NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eventos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL, -- 'seminario', 'encuentro', etc
  year text NOT NULL,
  event_date text NOT NULL,
  location text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  presentation_pdf text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Create Policies (Read access for everyone)
CREATE POLICY "Noticias are viewable by everyone." ON public.noticias
  FOR SELECT USING (is_published = true);

CREATE POLICY "Eventos are viewable by everyone." ON public.eventos
  FOR SELECT USING (is_published = true);

-- Add updated_at trigger (assuming the trigger function handle_updated_at exists from previous migrations, if not we will create it inline)
-- Just to be safe, creating function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_noticias_updated
  BEFORE UPDATE ON public.noticias
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_eventos_updated
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
