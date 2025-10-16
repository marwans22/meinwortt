-- Add RLS policy for admins to view all petitions
CREATE POLICY "Admins can view all petitions"
ON petitions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));