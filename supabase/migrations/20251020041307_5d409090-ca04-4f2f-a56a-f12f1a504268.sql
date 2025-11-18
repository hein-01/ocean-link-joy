-- Add field_type column to business_resources table to store indoor/outdoor/both selection
ALTER TABLE business_resources
ADD COLUMN field_type TEXT;