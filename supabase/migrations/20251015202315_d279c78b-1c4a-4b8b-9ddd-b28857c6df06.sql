-- Create storage bucket for petition images
INSERT INTO storage.buckets (id, name, public)
VALUES ('petition-images', 'petition-images', true);

-- Create policies for petition images
CREATE POLICY "Anyone can view petition images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'petition-images');

CREATE POLICY "Authenticated users can upload petition images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'petition-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own petition images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'petition-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own petition images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'petition-images' 
  AND auth.uid() IS NOT NULL
);