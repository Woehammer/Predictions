// supabase/functions/import-fixtures/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  const supabaseUrl = Deno.env.get("PROJECT_URL") || "";
  const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY") || "";
  const footballApiKey = Deno.env.get("FOOTBALL_DATA_API_KEY") || "";
  const season = 2025;

  if (!supabaseUrl || !supabaseKey || !footballApiKey) {
    console.error("❌ Missing environment variables");
    return new Response("Missing environment variables", { status: 500 });
  }

  // Fetch fixtures from Football-Data.org
  const response = await fetch(`https://api.football-data.org/v4/competitions/PL/matches?season=${season}`, {
    headers: {
      "X-Auth-Token": footballApiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("❌ Failed to fetch fixtures:", text);
    return new Response("Failed to fetch fixtures", { status: 500 });
  }

  const { matches } = await response.json();
  const now = new Date();

  // Filter future fixtures
  const filteredFixtures = matches
    .filter((match: any) => new Date(match.utcDate) > now)
    .map((match: any) => ({
      id: match.id,
      match_date: match.utcDate,
      status: match.status,
      matchday: match.matchday,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
    }));

  console.log(`ℹ️ Inserting ${filteredFixtures.length} upcoming fixtures into Supabase`);

  // Upsert fixtures into Supabase
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/fixtures?on_conflict=id`, {
    method: "POST",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(filteredFixtures),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    console.error("❌ Failed to insert fixtures:", insertResponse.status, errorText);
    return new Response("Failed to insert fixtures", { status: 500 });
  }

  console.log("✅ Fixtures imported successfully");
  return new Response("Fixtures imported successfully", { status: 200 });
});
