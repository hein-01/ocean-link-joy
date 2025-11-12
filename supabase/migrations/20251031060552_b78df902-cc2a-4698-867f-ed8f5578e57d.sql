-- Change salary_amount column from numeric to text to allow flexible input
ALTER TABLE job_postings 
ALTER COLUMN salary_amount TYPE text USING salary_amount::text;