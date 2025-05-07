
-- Function to get unique dates from the news_angola table
CREATE OR REPLACE FUNCTION public.get_user_summary_dates()
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;

-- Original function is kept but renamed for backwards compatibility
CREATE OR REPLACE FUNCTION public.get_unique_news_dates()
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;

-- Add a version that accepts username parameter but ignores it (for compatibility)
CREATE OR REPLACE FUNCTION public.get_user_summary_dates(p_username text)
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;
