-- Add new fields to petitions table for multi-step creation
ALTER TABLE petitions 
ADD COLUMN IF NOT EXISTS petition_type text CHECK (petition_type IN ('lokal', 'national', 'weltweit')),
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Update existing petitions to have default petition_type
UPDATE petitions SET petition_type = 'national' WHERE petition_type IS NULL;

-- Make petition_type required for new petitions
ALTER TABLE petitions ALTER COLUMN petition_type SET DEFAULT 'national';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_petitions_petition_type ON petitions(petition_type);
CREATE INDEX IF NOT EXISTS idx_petitions_location ON petitions(location) WHERE location IS NOT NULL;