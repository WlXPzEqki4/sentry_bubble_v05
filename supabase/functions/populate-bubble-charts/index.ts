
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

// Define types for our network data
interface BubbleChartNetwork {
  id: string;
  name: string;
  description: string;
  classification_level: string;
}

interface BubbleChartNode {
  network_id: string;
  label: string;
  size: number;
  community: number;
  description?: string;
  position_x: number;
  position_y: number;
}

interface BubbleChartEdge {
  network_id: string;
  source_id: string;
  target_id: string;
  weight: number;
  label?: string;
}

Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Now we can execute the function that will populate the database
    // First check if we already have tables
    const { data: existingNetworks, error: checkError } = await supabase
      .from('bubble_chart_networks')
      .select('id')
      .limit(1)

    if (checkError) {
      // Tables might not exist yet, we need to create them
      console.log('Tables may not exist or there was an error:', checkError.message)
      
      // Execute the SQL to create tables (ideally this would be done through migrations)
      // This is simplified - in a real app you'd want to use migrations
      const { error: sqlError } = await supabase.rpc('populate_bubble_chart_demo_edges')
      
      if (sqlError) {
        throw new Error(`Error populating demo data: ${sqlError.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Bubble chart demo data populated successfully',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (existingNetworks && existingNetworks.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Bubble chart tables already exist and contain data',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // If we get here, tables exist but are empty, so populate them
    await supabase.rpc('populate_bubble_chart_demo_edges')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bubble chart demo data populated successfully',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
