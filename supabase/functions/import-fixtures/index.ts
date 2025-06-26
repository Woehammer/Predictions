import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { type Fixture, fetchFixtures } from './fetch-fixtures.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  try {
    const fixtures: Fixture[] = await fetchFixtures();

    if (!fixtures.length) {
      return new Response('No fixtures found.', { status: 404 });
    }

    const { error } = await supabase
      .from('fixtures')
      .upsert(fixtures, { onConflict: ['id'] });

    if (error) {
      console.error('Upsert error:', error);
      return new Response('Failed to insert fixtures', { status: 500 });
    }

    return new Response('Fixtures imported successfully', { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response('Unexpected error occurred', { status: 500 });
  }
});
