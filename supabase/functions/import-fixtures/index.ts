// supabase/functions/import-fixtures/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  const supabaseUrl = Deno.env.get("PROJECT_URL") || "";
  const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY") || "";
  const footballApiKey = Deno.env.get("FOOTBALL_DATA_API_KEY") || "";
  const season = 2023;

  if (!supabaseUrl || !supabaseKey || !footballApiKey) {
    console.error("Missing required environment variables");
    return new Response("Missing environment variables", { status: 500 });
  }

  const response = await fetch(`https://api.football-data.org/v4/competitions/PL/matches?season=${season}`, {
    headers: {
      "X-Auth-Token": footballApiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed to fetch fixtures:", text);
    return new Response("Failed to fetch fixtures", { status: 500 });
  }

  const { matches } = await response.json();
  const now = new Date();

  const filteredFixtures = matches
    .filter((match: any) => new Date(match.utcDate) > now)
    .map((match: any) => ({
      id: match.id,
      utc_date: match.utcDate,
      status: match.status,
      matchday: match.matchday,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
    }));

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/fixtures`, {
    method: "POST",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(filteredFixtures),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    console.error("Failed to insert fixtures:", insertResponse.status, errorText);
    return new Response("Failed to insert fixtures", { status: 500 });
  }

  return new Response("Fixtures imported successfully", { status: 200 });
});
