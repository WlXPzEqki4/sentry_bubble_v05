
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if the Romeo and Juliet network already exists
    const { data: existingNetwork } = await supabaseClient
      .from('knowledge_graph_networks')
      .select('*')
      .eq('id', 'romeo-and-juliet-network')
      .single();

    // If it already exists, return early
    if (existingNetwork) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Romeo and Juliet network already exists', 
          data: existingNetwork 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Create Romeo and Juliet network
    const romeoAndJulietNetwork = {
      id: 'romeo-and-juliet-network',
      name: 'Romeo and Juliet Character Network',
      classification: 'unclassified',
      description: 'Character relationships from Shakespeare\'s Romeo and Juliet'
    };

    // Insert the network
    await supabaseClient
      .from('knowledge_graph_networks')
      .insert(romeoAndJulietNetwork);

    // Character nodes - match the structure from the image
    const characterNodes = [
      { id: 'node-1', title: 'Romeo', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 15 } },
      { id: 'node-2', title: 'Juliet', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 15 } },
      { id: 'node-3', title: 'Mercutio', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Neutral', size: 10 } },
      { id: 'node-4', title: 'Tybalt', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 12 } },
      { id: 'node-5', title: 'Benvolio', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 8 } },
      { id: 'node-6', title: 'Capulet', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 10 } },
      { id: 'node-7', title: 'Lady Capulet', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 8 } },
      { id: 'node-8', title: 'Lady Montague', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 7 } },
      { id: 'node-9', title: 'Montague', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 10 } },
      { id: 'node-10', title: 'Friar Lawrence', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Neutral', size: 13 } },
      { id: 'node-11', title: 'Paris', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 8 } },
      { id: 'node-12', title: 'The Nurse', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 12 } },
      { id: 'node-13', title: 'Peter', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 5 } },
      { id: 'node-14', title: 'Sampson', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 6 } },
      { id: 'node-15', title: 'Gregory', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Capulet', size: 6 } },
      { id: 'node-16', title: 'Balthasar', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 7 } },
      { id: 'node-17', title: 'Abram', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Montague', size: 6 } },
      { id: 'node-18', title: 'Prince Escalus', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Neutral', size: 11 } },
      { id: 'node-19', title: 'Friar John', type: 'person', network_id: 'romeo-and-juliet-network', properties: { family: 'Neutral', size: 7 } }
    ];

    // Insert character nodes
    await supabaseClient
      .from('knowledge_graph_nodes')
      .insert(characterNodes);

    // Relationship edges - match the structure from the image
    const relationshipEdges = [
      { source: 'node-1', target: 'node-2', label: 'loves', network_id: 'romeo-and-juliet-network', properties: { weight: 10 } },
      { source: 'node-1', target: 'node-3', label: 'friends', network_id: 'romeo-and-juliet-network', properties: { weight: 6 } },
      { source: 'node-1', target: 'node-5', label: 'cousins', network_id: 'romeo-and-juliet-network', properties: { weight: 8 } },
      { source: 'node-1', target: 'node-10', label: 'confides in', network_id: 'romeo-and-juliet-network', properties: { weight: 7 } },
      { source: 'node-1', target: 'node-6', label: 'confronts', network_id: 'romeo-and-juliet-network', properties: { weight: 2 } },
      { source: 'node-2', target: 'node-4', label: 'cousin', network_id: 'romeo-and-juliet-network', properties: { weight: 5 } },
      { source: 'node-2', target: 'node-12', label: 'cared by', network_id: 'romeo-and-juliet-network', properties: { weight: 7 } },
      { source: 'node-2', target: 'node-7', label: 'daughter of', network_id: 'romeo-and-juliet-network', properties: { weight: 6 } },
      { source: 'node-2', target: 'node-11', label: 'betrothed to', network_id: 'romeo-and-juliet-network', properties: { weight: 4 } },
      { source: 'node-6', target: 'node-4', label: 'nephew', network_id: 'romeo-and-juliet-network', properties: { weight: 4 } },
      { source: 'node-6', target: 'node-7', label: 'husband of', network_id: 'romeo-and-juliet-network', properties: { weight: 9 } },
      { source: 'node-7', target: 'node-12', label: 'employs', network_id: 'romeo-and-juliet-network', properties: { weight: 5 } },
      { source: 'node-5', target: 'node-17', label: 'commands', network_id: 'romeo-and-juliet-network', properties: { weight: 3 } },
      { source: 'node-3', target: 'node-18', label: 'related to', network_id: 'romeo-and-juliet-network', properties: { weight: 2 } },
      { source: 'node-10', target: 'node-19', label: 'sends message through', network_id: 'romeo-and-juliet-network', properties: { weight: 3 } },
      { source: 'node-9', target: 'node-1', label: 'father of', network_id: 'romeo-and-juliet-network', properties: { weight: 4 } },
      { source: 'node-8', target: 'node-1', label: 'mother of', network_id: 'romeo-and-juliet-network', properties: { weight: 3 } },
      { source: 'node-1', target: 'node-16', label: 'served by', network_id: 'romeo-and-juliet-network', properties: { weight: 3 } },
      { source: 'node-14', target: 'node-15', label: 'works with', network_id: 'romeo-and-juliet-network', properties: { weight: 2 } },
      { source: 'node-4', target: 'node-13', label: 'commands', network_id: 'romeo-and-juliet-network', properties: { weight: 1 } }
    ];

    // Insert relationship edges
    await supabaseClient
      .from('knowledge_graph_edges')
      .insert(relationshipEdges);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Romeo and Juliet network successfully created' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
