
-- Create tables for bubble chart visualization

-- Table for storing network configurations
CREATE TABLE IF NOT EXISTS public.bubble_chart_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  classification_level VARCHAR NOT NULL DEFAULT 'unclassified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing nodes with community, size, and position data
CREATE TABLE IF NOT EXISTS public.bubble_chart_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES public.bubble_chart_networks(id) ON DELETE CASCADE,
  label VARCHAR NOT NULL,
  size NUMERIC DEFAULT 1.0,
  community INTEGER,
  description TEXT,
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weighted connections between nodes
CREATE TABLE IF NOT EXISTS public.bubble_chart_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES public.bubble_chart_networks(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.bubble_chart_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.bubble_chart_nodes(id) ON DELETE CASCADE,
  weight NUMERIC DEFAULT 1.0,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bubble_chart_nodes_network_id ON public.bubble_chart_nodes(network_id);
CREATE INDEX IF NOT EXISTS idx_bubble_chart_edges_network_id ON public.bubble_chart_edges(network_id);
CREATE INDEX IF NOT EXISTS idx_bubble_chart_networks_classification ON public.bubble_chart_networks(classification_level);

-- Insert sample data for the Terrorist Network
INSERT INTO public.bubble_chart_networks (id, name, description, classification_level)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Terrorist Network Analysis', 'Analysis of terrorist network connections and communities', 'secret')
ON CONFLICT (id) DO NOTHING;

-- Insert sample nodes for the Terrorist Network
INSERT INTO public.bubble_chart_nodes (network_id, label, size, community, description, position_x, position_y)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'A', 3.5, 0, 'Network leader with connections to all communities', 400, 300),
  ('00000000-0000-0000-0000-000000000001', 'B', 2.8, 1, 'Intelligence handler', 200, 200),
  ('00000000-0000-0000-0000-000000000001', 'C', 2.5, 1, 'Field operative', 150, 350),
  ('00000000-0000-0000-0000-000000000001', 'D', 2.2, 2, 'Operations coordinator', 600, 200),
  ('00000000-0000-0000-0000-000000000001', 'E', 1.8, 2, 'Field operative', 700, 350),
  ('00000000-0000-0000-0000-000000000001', 'F', 1.5, 3, 'Logistics coordinator', 350, 500),
  ('00000000-0000-0000-0000-000000000001', 'G', 1.3, 3, 'Supply chain manager', 500, 500),
  ('00000000-0000-0000-0000-000000000001', 'H', 1.0, 4, 'Communications specialist', 300, 100),
  ('00000000-0000-0000-0000-000000000001', 'I', 0.8, 5, 'Regional commander', 650, 450),
  ('00000000-0000-0000-0000-000000000001', 'J', 0.7, 5, 'Regional commander', 800, 500)
ON CONFLICT DO NOTHING;

-- Insert sample edges for the Terrorist Network (we'll need to get the actual node IDs in a real implementation)
-- For the sample data, we'll need to execute this after getting the actual IDs from the inserted nodes

-- Insert sample data for the Criminal Network
INSERT INTO public.bubble_chart_networks (id, name, description, classification_level)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Criminal Organization Structure', 'Mapping of criminal organization hierarchy and relationships', 'unclassified')
ON CONFLICT (id) DO NOTHING;

-- Insert sample nodes for the Criminal Network
INSERT INTO public.bubble_chart_nodes (network_id, label, size, community, description, position_x, position_y)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Boss', 4.0, 0, 'Organization leader', 400, 100),
  ('00000000-0000-0000-0000-000000000002', 'Underboss', 3.2, 0, 'Second in command', 400, 200),
  ('00000000-0000-0000-0000-000000000002', 'Consigliere', 3.0, 0, 'Advisor', 550, 200),
  ('00000000-0000-0000-0000-000000000002', 'Capo 1', 2.5, 1, 'Captain of crew 1', 200, 300),
  ('00000000-0000-0000-0000-000000000002', 'Capo 2', 2.5, 2, 'Captain of crew 2', 400, 300),
  ('00000000-0000-0000-0000-000000000002', 'Capo 3', 2.5, 3, 'Captain of crew 3', 600, 300),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 1', 1.5, 1, 'Crew 1 member', 150, 400),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 2', 1.5, 1, 'Crew 1 member', 250, 400),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 3', 1.5, 2, 'Crew 2 member', 350, 400),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 4', 1.5, 2, 'Crew 2 member', 450, 400),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 5', 1.5, 3, 'Crew 3 member', 550, 400),
  ('00000000-0000-0000-0000-000000000002', 'Soldier 6', 1.5, 3, 'Crew 3 member', 650, 400),
  ('00000000-0000-0000-0000-000000000002', 'Associate 1', 0.8, 1, 'External helper', 200, 500),
  ('00000000-0000-0000-0000-000000000002', 'Associate 2', 0.8, 2, 'External helper', 400, 500),
  ('00000000-0000-0000-0000-000000000002', 'Associate 3', 0.8, 3, 'External helper', 600, 500)
ON CONFLICT DO NOTHING;

-- Insert sample data for the Intelligence Network
INSERT INTO public.bubble_chart_networks (id, name, description, classification_level)
VALUES 
  ('00000000-0000-0000-0000-000000000003', 'Intelligence Community Links', 'Connections between intelligence agencies and operatives', 'top_secret')
ON CONFLICT (id) DO NOTHING;

-- Insert sample nodes for the Intelligence Network
INSERT INTO public.bubble_chart_nodes (network_id, label, size, community, description, position_x, position_y)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'CIA', 3.8, 0, 'Central Intelligence Agency', 400, 200),
  ('00000000-0000-0000-0000-000000000003', 'FBI', 3.5, 1, 'Federal Bureau of Investigation', 200, 300),
  ('00000000-0000-0000-0000-000000000003', 'NSA', 3.5, 2, 'National Security Agency', 600, 300),
  ('00000000-0000-0000-0000-000000000003', 'DIA', 2.8, 0, 'Defense Intelligence Agency', 350, 400),
  ('00000000-0000-0000-0000-000000000003', 'NGA', 2.5, 0, 'National Geospatial-Intelligence Agency', 450, 400),
  ('00000000-0000-0000-0000-000000000003', 'NRO', 2.5, 0, 'National Reconnaissance Office', 500, 350),
  ('00000000-0000-0000-0000-000000000003', 'FinCEN', 2.0, 1, 'Financial Crimes Enforcement Network', 150, 400),
  ('00000000-0000-0000-0000-000000000003', 'ATF', 2.0, 1, 'Bureau of Alcohol, Tobacco, Firearms and Explosives', 250, 400),
  ('00000000-0000-0000-0000-000000000003', 'CYBERCOM', 2.2, 2, 'United States Cyber Command', 700, 350),
  ('00000000-0000-0000-0000-000000000003', 'USCG Intel', 1.8, 0, 'Coast Guard Intelligence', 300, 500),
  ('00000000-0000-0000-0000-000000000003', 'DOS-INR', 1.7, 3, 'Department of State - Bureau of Intelligence and Research', 500, 500),
  ('00000000-0000-0000-0000-000000000003', 'DHS-I&A', 1.7, 3, 'Department of Homeland Security - Intelligence and Analysis', 600, 500),
  ('00000000-0000-0000-0000-000000000003', 'DEA', 1.8, 1, 'Drug Enforcement Administration', 100, 350),
  ('00000000-0000-0000-0000-000000000003', 'OICI', 1.4, 3, 'Office of Intelligence and Counterintelligence', 700, 500),
  ('00000000-0000-0000-0000-000000000003', 'Five Eyes', 3.0, 4, 'Intelligence alliance of five countries', 400, 100),
  ('00000000-0000-0000-0000-000000000003', 'MI6', 2.7, 4, 'UK Secret Intelligence Service', 300, 150),
  ('00000000-0000-0000-0000-000000000003', 'CSIS', 2.5, 4, 'Canadian Security Intelligence Service', 500, 150)
ON CONFLICT DO NOTHING;

-- Create function to get bubble chart networks based on user classification level
CREATE OR REPLACE FUNCTION public.get_bubble_chart_networks(p_classification_level TEXT DEFAULT 'unclassified')
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  classification_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple classification hierarchy check
  RETURN QUERY
  SELECT 
    bcn.id,
    bcn.name,
    bcn.description,
    bcn.classification_level,
    bcn.created_at
  FROM 
    public.bubble_chart_networks bcn
  WHERE
    CASE
      WHEN p_classification_level = 'top_secret' THEN TRUE
      WHEN p_classification_level = 'secret' AND bcn.classification_level != 'top_secret' THEN TRUE
      WHEN p_classification_level = 'unclassified' AND bcn.classification_level = 'unclassified' THEN TRUE
      ELSE FALSE
    END
  ORDER BY 
    bcn.name;
END;
$$;

-- Create function to get bubble chart nodes for a specific network
CREATE OR REPLACE FUNCTION public.get_bubble_chart_nodes(p_network_id UUID)
RETURNS TABLE (
  id UUID,
  label TEXT,
  size NUMERIC,
  community INTEGER,
  description TEXT,
  position_x NUMERIC,
  position_y NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bcn.id,
    bcn.label,
    bcn.size,
    bcn.community,
    bcn.description,
    bcn.position_x,
    bcn.position_y
  FROM 
    public.bubble_chart_nodes bcn
  WHERE
    bcn.network_id = p_network_id
  ORDER BY 
    bcn.label;
END;
$$;

-- Create function to get bubble chart edges for a specific network
CREATE OR REPLACE FUNCTION public.get_bubble_chart_edges(p_network_id UUID)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  target_id UUID,
  weight NUMERIC,
  label TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bce.id,
    bce.source_id,
    bce.target_id,
    bce.weight,
    bce.label
  FROM 
    public.bubble_chart_edges bce
  WHERE
    bce.network_id = p_network_id;
END;
$$;

-- Create a function that populates edges for demo networks
CREATE OR REPLACE FUNCTION public.populate_bubble_chart_demo_edges()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  source_node_id UUID;
  target_node_id UUID;
  network_id UUID;
BEGIN
  -- Get the terrorist network ID
  network_id := '00000000-0000-0000-0000-000000000001';
  
  -- Only proceed if we don't already have edges for this network
  IF NOT EXISTS (SELECT 1 FROM public.bubble_chart_edges WHERE network_id = network_id) THEN
    -- For each pair of nodes we want to connect, get their IDs and create an edge
    
    -- A -> B (leader to intelligence handler)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'B';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 3.0);
    END IF;
    
    -- A -> D (leader to operations coordinator)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'D';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 3.0);
    END IF;
    
    -- A -> F (leader to logistics coordinator)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'F';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 2.0);
    END IF;
    
    -- A -> H (leader to communications specialist)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'H';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 1.5);
    END IF;
    
    -- A -> I (leader to regional commander)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'I';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 2.0);
    END IF;
    
    -- A -> J (leader to regional commander)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'A';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'J';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 2.0);
    END IF;
    
    -- B -> C (intelligence handler to field operative)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'B';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'C';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 4.0);
    END IF;
    
    -- D -> E (operations coordinator to field operative)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'D';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'E';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 3.0);
    END IF;
    
    -- F -> G (logistics coordinator to supply chain manager)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'F';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'G';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 2.5);
    END IF;
    
    -- Add a few more connections
    -- B -> D (intelligence handler to operations coordinator)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'B';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'D';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 1.0);
    END IF;
    
    -- C -> E (field operative to field operative)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'C';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'E';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 1.0);
    END IF;
    
    -- I -> J (regional commander to regional commander)
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'I';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'J';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 1.5);
    END IF;
  END IF;
  
  -- Now, let's add edges for the criminal network
  network_id := '00000000-0000-0000-0000-000000000002';
  
  -- Only proceed if we don't already have edges for this network
  IF NOT EXISTS (SELECT 1 FROM public.bubble_chart_edges WHERE network_id = network_id) THEN
    -- Boss -> Underboss
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'Boss';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'Underboss';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 5.0);
    END IF;
    
    -- Add more connections for criminal network
    -- (similar pattern to populate other connections...)
  END IF;
  
  -- Finally, let's add edges for the intelligence network
  network_id := '00000000-0000-0000-0000-000000000003';
  
  -- Only proceed if we don't already have edges for this network
  IF NOT EXISTS (SELECT 1 FROM public.bubble_chart_edges WHERE network_id = network_id) THEN
    -- CIA -> FBI
    SELECT id INTO source_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'CIA';
    
    SELECT id INTO target_node_id FROM public.bubble_chart_nodes 
    WHERE network_id = network_id AND label = 'FBI';
    
    IF source_node_id IS NOT NULL AND target_node_id IS NOT NULL THEN
      INSERT INTO public.bubble_chart_edges (network_id, source_id, target_id, weight)
      VALUES (network_id, source_node_id, target_node_id, 2.5);
    END IF;
    
    -- Add more connections for intelligence network
    -- (similar pattern to populate other connections...)
  END IF;
END;
$$;

-- Execute the function to populate edges
SELECT public.populate_bubble_chart_demo_edges();
