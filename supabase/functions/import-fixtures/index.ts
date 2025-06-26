// supabase/functions/import-fixtures/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

console.log("Import Fixtures Function Started")

serve(async (req) => {
  const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!apiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing environment variables")
    return new Response("Missing env vars", { status: 500 })
  }

  const competitionId = 2021 // Premier League
  const season = 2025
  const apiUrl = `https://api.football-data.org/v4/competitions/${competitionId}/matches?season=${season}`

  const fetchResponse = await fetch(apiUrl, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  })

  if (!fetchResponse.ok) {
    console.error("Failed to fetch data", await fetchResponse.text())
    return new Response("Failed to fetch fixtures", { status: 500 })
  }

  const data = await fetchResponse.json()

  const matches = data.matches.filter((match: any) => match.status !== "POSTPONED")

  const payload = matches.map((match: any) => ({
    id: match.id,
    utc_date: match.utcDate,
    home_team: match.homeTeam.name,
    away_team: match.awayTeam.name,
    home_team_id: match.homeTeam.id,
    away_team_id: match.awayTeam.id,
    matchday: match.matchday,
    status: match.status,
    competition_id: competitionId,
    season: season,
  }))

  const response = await fetch(`${supabaseUrl}/rest/v1/fixtures`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseServiceRoleKey,
      "Authorization": `Bearer ${supabaseServiceRoleKey}`,
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Failed to upsert fixtures", errorText)
    return new Response("Upsert failed", { status: 500 })
  }

  return new Response(`Imported ${payload.length} fixtures for season ${season}`, { status: 200 })
})
