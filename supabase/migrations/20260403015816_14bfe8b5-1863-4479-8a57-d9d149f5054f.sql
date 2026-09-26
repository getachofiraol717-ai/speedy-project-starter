
-- Allow admins to delete study sessions
CREATE POLICY "Admins can delete study sessions"
ON public.study_sessions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete video progress
CREATE POLICY "Admins can delete video progress"
ON public.video_progress FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
