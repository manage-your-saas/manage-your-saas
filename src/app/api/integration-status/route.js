import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  try {
    const { data, error } = await supabase
      .from('integration_status')
      .select('integration, status')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const statuses = data.reduce((acc, { integration, status }) => {
      acc[integration] = status;
      return acc;
    }, {});

    return new Response(JSON.stringify(statuses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching integration statuses:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch integration statuses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
