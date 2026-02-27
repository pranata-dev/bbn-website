-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth_id = auth.uid());

-- Allow users to update their own profile (if needed, otherwise just SELECT)
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth_id = auth.uid());

-- Allow admins full access to the users table
CREATE POLICY "Admins have full access to users" 
ON users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND role = 'ADMIN'
  )
);
