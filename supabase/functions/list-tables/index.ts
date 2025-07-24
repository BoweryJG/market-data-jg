/* eslint-env deno */
/* global Deno */
// Use the types from our local types.d.ts file instead of a remote reference
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define types for the database schema
type TableInfo = {
  name: string;
  rowCount: number;
  columns: string[];
  sample: Record<string, unknown>[] | null;
};

type PgTable = {
  tablename: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Query to get all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')

    if (error) throw error

    // For each table, get row count and sample data
    const tableData: TableInfo[] = await Promise.all(
      (tables as PgTable[]).map(async (table) => {
        const { count } = await supabase
          .from(table.tablename)
          .select('*', { count: 'exact', head: true })
        
        let sampleData: any[] | null = null
        if (count && count > 0) {
          const { data: sample } = await supabase
            .from(table.tablename)
            .select('*')
            .limit(2)
          sampleData = sample || null
        }

        return {
          name: table.tablename,
          rowCount: count || 0,
          columns: sampleData && Array.isArray(sampleData) && sampleData.length > 0 ? Object.keys(sampleData[0] as object) : [],
          sample: sampleData
        }
      })
    )

    return new Response(
      JSON.stringify({ tables: tableData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/list-tables' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
