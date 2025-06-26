Deno.serve(async () => {
  try {
    const fixtures: Fixture[] = await fetchFixtures();

    if (!fixtures.length) {
      console.log('No fixtures returned from fetch.');
      return new Response('No fixtures found.', { status: 404 });
    }

    const { error } = await supabase
      .from('fixtures')
      .upsert(fixtures, { onConflict: ['id'] });

    if (error) {
      console.error('Supabase upsert error:', error.message, error.details);
      return new Response('Failed to insert fixtures', { status: 500 });
    }

    return new Response('Fixtures imported successfully', { status: 200 });

  } catch (err) {
    console.error('Unexpected edge function error:', err);
    return new Response('Unexpected error occurred', { status: 500 });
  }
});
