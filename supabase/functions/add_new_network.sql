
-- Add a new network to the knowledge_graph_networks table
INSERT INTO public.knowledge_graph_networks (id, name, classification, description)
VALUES 
  ('terrorism-network', 'Terrorism Network Analysis', 'secret', 'Analysis of terrorist networks and their connections');

-- Add nodes for the terrorism network
INSERT INTO public.knowledge_graph_nodes (id, title, type, network_id, properties, tags)
VALUES
  ('cell-1', 'Cell Alpha', 'organization', 'terrorism-network', '{"location": "Northern Region", "members": 12, "founded": "2018"}', '["active", "training"]'),
  ('cell-2', 'Cell Beta', 'organization', 'terrorism-network', '{"location": "Eastern Region", "members": 8, "founded": "2019"}', '["active", "operations"]'),
  ('cell-3', 'Cell Gamma', 'organization', 'terrorism-network', '{"location": "Southern Region", "members": 15, "founded": "2017"}', '["dormant"]'),
  ('leader-1', 'Abdul Rahman', 'person', 'terrorism-network', '{"age": 45, "nationality": "Unknown", "role": "Commander"}', '["high-value"]'),
  ('leader-2', 'Mohammed K.', 'person', 'terrorism-network', '{"age": 38, "nationality": "Unknown", "role": "Financier"}', '["high-value"]'),
  ('leader-3', 'Ibrahim S.', 'person', 'terrorism-network', '{"age": 41, "nationality": "Unknown", "role": "Recruiter"}', '["medium-value"]'),
  ('event-1', 'Training Camp Alpha', 'event', 'terrorism-network', '{"date": "2023-01-15", "location": "Mountain Region", "participants": 20}', '["training"]'),
  ('event-2', 'Operation Falcon', 'event', 'terrorism-network', '{"date": "2023-04-22", "location": "Urban Area", "casualties": 0}', '["operation"]'),
  ('resource-1', 'Weapons Cache A', 'resource', 'terrorism-network', '{"type": "weapons", "quantity": "large", "discovered": "2023-02-10"}', '["supply"]'),
  ('resource-2', 'Financial Network', 'resource', 'terrorism-network', '{"type": "funding", "amount": "significant", "sources": "multiple"}', '["finance"]');

-- Add edges for the terrorism network
INSERT INTO public.knowledge_graph_edges (id, source, target, label, network_id, properties)
VALUES
  ('edge-1', 'leader-1', 'cell-1', 'commands', 'terrorism-network', '{"strength": "strong", "duration": "3 years"}'),
  ('edge-2', 'leader-1', 'cell-2', 'influences', 'terrorism-network', '{"strength": "moderate", "duration": "1 year"}'),
  ('edge-3', 'leader-2', 'resource-2', 'controls', 'terrorism-network', '{"strength": "strong", "duration": "4 years"}'),
  ('edge-4', 'leader-3', 'cell-1', 'recruits_for', 'terrorism-network', '{"strength": "strong", "recent": true}'),
  ('edge-5', 'leader-3', 'cell-3', 'founded', 'terrorism-network', '{"strength": "strong", "year": "2017"}'),
  ('edge-6', 'cell-1', 'event-1', 'participated', 'terrorism-network', '{"personnel": 8}'),
  ('edge-7', 'cell-2', 'event-2', 'executed', 'terrorism-network', '{"personnel": 6}'),
  ('edge-8', 'cell-1', 'resource-1', 'accesses', 'terrorism-network', '{"frequency": "regular"}'),
  ('edge-9', 'cell-2', 'resource-2', 'funded_by', 'terrorism-network', '{"amount": "moderate"}'),
  ('edge-10', 'cell-3', 'resource-2', 'funded_by', 'terrorism-network', '{"amount": "significant"}');

-- Also add a bubble chart network to match
INSERT INTO public.graph_nodes (node_id, display_name, family, val, graph_id)
VALUES
  ('abdul', 'Abdul Rahman', 'Leadership', 25, 'terrorism-network'),
  ('mohammed', 'Mohammed K.', 'Leadership', 22, 'terrorism-network'),
  ('ibrahim', 'Ibrahim S.', 'Leadership', 20, 'terrorism-network'),
  ('cell-alpha', 'Cell Alpha', 'Cells', 18, 'terrorism-network'),
  ('cell-beta', 'Cell Beta', 'Cells', 16, 'terrorism-network'),
  ('cell-gamma', 'Cell Gamma', 'Cells', 15, 'terrorism-network'),
  ('recruit-1', 'Recruit 1', 'Operatives', 8, 'terrorism-network'),
  ('recruit-2', 'Recruit 2', 'Operatives', 8, 'terrorism-network'),
  ('recruit-3', 'Recruit 3', 'Operatives', 10, 'terrorism-network'),
  ('recruit-4', 'Recruit 4', 'Operatives', 9, 'terrorism-network'),
  ('resource-a', 'Weapons Cache', 'Resources', 12, 'terrorism-network'),
  ('resource-b', 'Funding Network', 'Resources', 14, 'terrorism-network');

-- Add links for the bubble chart terrorism network
INSERT INTO public.graph_links (source, target, value, graph_id)
VALUES
  ('abdul', 'cell-alpha', 8, 'terrorism-network'),
  ('abdul', 'cell-beta', 5, 'terrorism-network'),
  ('mohammed', 'cell-beta', 7, 'terrorism-network'),
  ('mohammed', 'resource-b', 10, 'terrorism-network'),
  ('ibrahim', 'cell-alpha', 6, 'terrorism-network'),
  ('ibrahim', 'cell-gamma', 8, 'terrorism-network'),
  ('ibrahim', 'recruit-1', 4, 'terrorism-network'),
  ('ibrahim', 'recruit-2', 4, 'terrorism-network'),
  ('cell-alpha', 'recruit-1', 3, 'terrorism-network'),
  ('cell-alpha', 'recruit-2', 3, 'terrorism-network'),
  ('cell-alpha', 'resource-a', 6, 'terrorism-network'),
  ('cell-beta', 'recruit-3', 3, 'terrorism-network'),
  ('cell-beta', 'recruit-4', 3, 'terrorism-network'),
  ('cell-beta', 'resource-b', 5, 'terrorism-network'),
  ('cell-gamma', 'recruit-1', 2, 'terrorism-network'),
  ('cell-gamma', 'resource-b', 7, 'terrorism-network');
