-- SQL script to create the skill_requests table in Supabase
-- Run this in your Supabase SQL editor

-- Check if skill_requests table exists, if not create it
-- Note: Adjust column names based on your existing schema patterns
CREATE TABLE IF NOT EXISTS public.skill_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id TEXT UNIQUE NOT NULL,  -- Using snake_case to match your schema
    client_name TEXT NOT NULL,
    client_email TEXT,
    project_name TEXT NOT NULL,
    project_description TEXT,
    requested_by TEXT DEFAULT 'HR Team',
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_start_date DATE NOT NULL,
    project_duration_weeks INTEGER DEFAULT 12,
    team_size_required INTEGER DEFAULT 3,
    priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'analyzing', 'proposed', 'training_scheduled', 'profiles_sent', 'interviews_scheduled', 'fulfilled')) DEFAULT 'pending',
    skills JSONB NOT NULL DEFAULT '[]',
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_skill_requests_status ON public.skill_requests(status);
CREATE INDEX IF NOT EXISTS idx_skill_requests_created_at ON public.skill_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_requests_request_id ON public.skill_requests(requestId);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_skill_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
DROP TRIGGER IF EXISTS update_skill_requests_updated_at ON public.skill_requests;
CREATE TRIGGER update_skill_requests_updated_at
    BEFORE UPDATE ON public.skill_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_requests_updated_at();

-- Enable Row Level Security (RLS) 
ALTER TABLE public.skill_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for access control (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON public.skill_requests
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.skill_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.skill_requests
    FOR UPDATE USING (true);

-- Insert some sample data
INSERT INTO public.skill_requests (
    request_id, client_name, client_email, project_name, project_description, 
    requested_by, required_start_date, project_duration_weeks, team_size_required, 
    priority, status, skills
) VALUES (
    'REQ-2025-001',
    'TechCorp Solutions',
    'contact@techcorp.com',
    'AI Platform Development',
    'Building next-generation AI platform with machine learning capabilities',
    'HR Team',
    '2025-09-23',
    16,
    4,
    'high',
    'analyzing',
    '[
        {"skill": "Python", "level": "expert", "count": 3, "mandatory": true},
        {"skill": "Machine Learning", "level": "expert", "count": 2, "mandatory": true},
        {"skill": "TensorFlow", "level": "intermediate", "count": 2, "mandatory": true},
        {"skill": "Deep Learning", "level": "intermediate", "count": 2, "mandatory": false}
    ]'::jsonb
), (
    'REQ-2025-002',
    'DataFlow Analytics',
    'projects@dataflow.com',
    'Real-time Analytics Dashboard',
    'Development of real-time data processing and visualization platform',
    'Sales Team',
    '2025-09-15',
    12,
    3,
    'medium',
    'pending',
    '[
        {"skill": "React", "level": "expert", "count": 2, "mandatory": true},
        {"skill": "Node.js", "level": "intermediate", "count": 2, "mandatory": true},
        {"skill": "MongoDB", "level": "intermediate", "count": 1, "mandatory": false}
    ]'::jsonb
) ON CONFLICT (request_id) DO NOTHING;