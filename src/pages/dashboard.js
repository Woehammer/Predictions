useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    // Get all league memberships for this user
    const { data: memberships, error: memberError } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('Error fetching memberships:', memberError);
      return;
    }

    const leagueIds = memberships.map(m => m.league_id);

    // Get leagues user is a member of
    let userLeagues = [];
    if (leagueIds.length > 0) {
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('id, name, is_public, invite_code')
        .in('id', leagueIds);

      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError);
      } else {
        userLeagues = leaguesData;
      }
    }

    setLeagues(userLeagues);

    // Fetch points
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    setPoints(pointsData?.total_points || 0);

    // Public leagues
    const { data: publicData } = await supabase
      .from('leagues')
      .select()
      .eq('is_public', true);

    setPublicLeagues(publicData || []);

    // Recent results
    const { data: results } = await supabase
      .from('predictions')
      .select('fixtures(home_team, away_team, actual_home_score, actual_away_score), predicted_home_score, predicted_away_score')
      .eq('user_id', user.id)
      .not('fixtures.actual_home_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentResults(results || []);

    // Upcoming fixtures
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select()
      .gt('match_date', new Date().toISOString())
      .order('match_date')
      .limit(5);

    setUpcomingFixtures(fixtures || []);
  };

  fetchData();
}, [user]);
