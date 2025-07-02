import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import "https://deno.land/std@0.177.0/dotenv/load.ts";

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch fixtures from Football-data.org
async function fetchFixtures(): Promise<any[]> {
  const API_URL = "https://api.football-data.org/v4/competitions/PL/matches?season=2025";
  const API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");

  const res = await fetch(API_URL, {
    headers: { "X-Auth-Token": API_KEY }
  });

  if (!res.ok) {
    console.error("Failed to fetch fixtures:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  const matches = data.matches;

  return matches.map((fixture: any) => ({
    id: fixture.id.toString(), // Assuming you're using the Football-data ID as your fixture ID
    match_date: fixture.utcDate,
    home_team: fixture.homeTeam.name,
    away_team: fixture.awayTeam.name,
    matchday: fixture.matchday,
    actual_home_score: fixture.score?.fullTime?.home ?? null,
    actual_away_score: fixture.score?.fullTime?.away ?? null,
  }));
}

// Edge function
serve(async () => {
  try {
    const fixtures = await fetchFixtures();

    if (!fixtures.length) {
      console.log("No fixtures returned from fetch.");
      return new Response("No fixtures found.", { status: 404 });
    }

    const { error } = await supabase
      .from("fixtures")
      .upsert(fixtures, { onConflict: ["id"] });

    if (error) {
      console.error("Supabase upsert error:", error.message, error.details);
      return new Response("Failed to insert fixtures", { status: 500 });
    }

    return new Response("Fixtures imported successfully", { status: 200 });
  } catch (err) {
    console.error("Unexpected edge function error:", err);
    return new Response("Unexpected error occurred", { status: 500 });
  }
});
