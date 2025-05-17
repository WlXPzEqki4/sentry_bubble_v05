
-- Create tables for graph nodes and links
CREATE TABLE IF NOT EXISTS public.graph_nodes (
  id SERIAL PRIMARY KEY,
  node_id VARCHAR(255) NOT NULL,  -- String identifier (e.g., "Romeo")
  display_name VARCHAR(255) NOT NULL, -- Display name 
  family VARCHAR(255) NOT NULL,   -- Group/family (e.g., "Montague", "Capulet", "Neutral")
  val INTEGER NOT NULL,           -- Size/value of the node
  graph_id VARCHAR(255) NOT NULL, -- Identifier for which graph this node belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by graph_id
CREATE INDEX IF NOT EXISTS idx_graph_nodes_graph_id ON public.graph_nodes(graph_id);

-- Create links table
CREATE TABLE IF NOT EXISTS public.graph_links (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255) NOT NULL,   -- Source node_id
  target VARCHAR(255) NOT NULL,   -- Target node_id
  value INTEGER NOT NULL,         -- Strength/weight of connection
  graph_id VARCHAR(255) NOT NULL, -- Identifier for which graph this link belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by graph_id
CREATE INDEX IF NOT EXISTS idx_graph_links_graph_id ON public.graph_links(graph_id);

-- Insert Romeo and Juliet nodes
INSERT INTO public.graph_nodes (node_id, display_name, family, val, graph_id) VALUES
('romeo', 'Romeo', 'Montague', 20, 'romeo-and-juliet'),
('montague', 'Montague', 'Montague', 15, 'romeo-and-juliet'),
('lady-montague', 'Lady Montague', 'Montague', 10, 'romeo-and-juliet'),
('benvolio', 'Benvolio', 'Montague', 12, 'romeo-and-juliet'),
('mercutio', 'Mercutio', 'Montague', 18, 'romeo-and-juliet'),
('juliet', 'Juliet', 'Capulet', 20, 'romeo-and-juliet'),
('capulet', 'Capulet', 'Capulet', 15, 'romeo-and-juliet'),
('lady-capulet', 'Lady Capulet', 'Capulet', 10, 'romeo-and-juliet'),
('tybalt', 'Tybalt', 'Capulet', 16, 'romeo-and-juliet'),
('nurse', 'Nurse', 'Capulet', 14, 'romeo-and-juliet'),
('prince-escalus', 'Prince Escalus', 'Neutral', 18, 'romeo-and-juliet'),
('paris', 'Paris', 'Neutral', 12, 'romeo-and-juliet'),
('friar-lawrence', 'Friar Lawrence', 'Neutral', 16, 'romeo-and-juliet'),
('rosaline', 'Rosaline', 'Capulet', 8, 'romeo-and-juliet'),
('balthasar', 'Balthasar', 'Montague', 8, 'romeo-and-juliet'),
('sampson', 'Sampson', 'Capulet', 6, 'romeo-and-juliet'),
('gregory', 'Gregory', 'Capulet', 6, 'romeo-and-juliet'),
('peter', 'Peter', 'Neutral', 5, 'romeo-and-juliet'),
('abraham', 'Abraham', 'Montague', 5, 'romeo-and-juliet');

-- Insert Romeo and Juliet links
INSERT INTO public.graph_links (source, target, value, graph_id) VALUES
('romeo', 'juliet', 10, 'romeo-and-juliet'),
('romeo', 'montague', 5, 'romeo-and-juliet'),
('romeo', 'mercutio', 8, 'romeo-and-juliet'),
('romeo', 'benvolio', 7, 'romeo-and-juliet'),
('romeo', 'friar-lawrence', 6, 'romeo-and-juliet'),
('romeo', 'balthasar', 3, 'romeo-and-juliet'),
('romeo', 'rosaline', 2, 'romeo-and-juliet'),
('romeo', 'tybalt', 4, 'romeo-and-juliet'),
('juliet', 'capulet', 5, 'romeo-and-juliet'),
('juliet', 'lady-capulet', 4, 'romeo-and-juliet'),
('juliet', 'nurse', 7, 'romeo-and-juliet'),
('juliet', 'friar-lawrence', 6, 'romeo-and-juliet'),
('juliet', 'tybalt', 3, 'romeo-and-juliet'),
('juliet', 'paris', 4, 'romeo-and-juliet'),
('montague', 'lady-montague', 6, 'romeo-and-juliet'),
('montague', 'benvolio', 3, 'romeo-and-juliet'),
('capulet', 'lady-capulet', 6, 'romeo-and-juliet'),
('capulet', 'tybalt', 4, 'romeo-and-juliet'),
('capulet', 'paris', 3, 'romeo-and-juliet'),
('capulet', 'prince-escalus', 2, 'romeo-and-juliet'),
('mercutio', 'benvolio', 5, 'romeo-and-juliet'),
('mercutio', 'tybalt', 5, 'romeo-and-juliet'),
('mercutio', 'paris', 2, 'romeo-and-juliet'),
('mercutio', 'prince-escalus', 3, 'romeo-and-juliet'),
('nurse', 'friar-lawrence', 2, 'romeo-and-juliet'),
('tybalt', 'benvolio', 3, 'romeo-and-juliet'),
('prince-escalus', 'paris', 3, 'romeo-and-juliet'),
('sampson', 'gregory', 4, 'romeo-and-juliet'),
('sampson', 'abraham', 2, 'romeo-and-juliet'),
('gregory', 'abraham', 2, 'romeo-and-juliet'),
('paris', 'friar-lawrence', 2, 'romeo-and-juliet');

-- Create functions to get graph data
CREATE OR REPLACE FUNCTION public.get_available_graphs()
RETURNS TABLE (
  graph_id TEXT,
  node_count BIGINT,
  link_count BIGINT
) 
LANGUAGE SQL
AS $$
  SELECT 
    graph_id, 
    COUNT(DISTINCT node_id) as node_count,
    (SELECT COUNT(*) FROM public.graph_links l WHERE l.graph_id = n.graph_id) as link_count
  FROM 
    public.graph_nodes n
  GROUP BY 
    graph_id
  ORDER BY 
    graph_id;
$$;

-- Function to get graph data by graph_id
CREATE OR REPLACE FUNCTION public.get_graph_data(p_graph_id TEXT)
RETURNS JSON
LANGUAGE PLPGSQL
AS $$
DECLARE
  result JSON;
BEGIN
  WITH nodes_data AS (
    SELECT 
      json_agg(
        json_build_object(
          'id', node_id,
          'family', family,
          'val', val,
          'label', display_name
        )
      ) AS nodes
    FROM 
      public.graph_nodes
    WHERE 
      graph_id = p_graph_id
  ),
  links_data AS (
    SELECT 
      json_agg(
        json_build_object(
          'source', source,
          'target', target,
          'value', value
        )
      ) AS links
    FROM 
      public.graph_links
    WHERE 
      graph_id = p_graph_id
  )
  SELECT 
    json_build_object(
      'nodes', COALESCE(nodes_data.nodes, '[]'::json),
      'links', COALESCE(links_data.links, '[]'::json)
    ) INTO result
  FROM 
    nodes_data, links_data;
    
  RETURN result;
END;
$$;
