import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { useUser } from '@supabase/auth-helpers-react';
import dayjs from 'dayjs';

export default function PredictionsPage() {
  const user = useUser();
  const [fixtures, setFixtures] = useState([]);
  const [gameWeeks, setGameWeeks] = useState([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [bonusPicks, setBonusPicks] = useState({});

  useEffect(() => {
    if (user) fetchFixtures();
  }, [user]);

  const fetchFixtures = async () => {
    const { data: fixturesData } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date');

    const { data: predictionsData } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);

    const predMap = {};
    const bonusMap = {};

    predictionsData?.forEach(p => {
      predMap[p.fixture_id] = {
        home: p.predicted_home_score,
        away: p.predicted_away_score,
        points: p.points,
      };
      if (p.is_bonus) bonusMap[p.fixture_id] = true;
    });

    setPredictions(predMap);
    setBonusPicks(bonusMap);

    const grouped = groupFixturesByWeek(fixturesData);
    setGameWeeks(grouped);
  };

  const groupFixturesByWeek = (fixtures) => {
    if (!fixtures.length) return [];

    const weeks = [];
    let currentWeek = [];
    let currentStart = dayjs(fixtures[0].match_date).startOf('week');

    fixtures.forEach((fixture) => {
      const date = dayjs(fixture.match_date);
      if (date.isAfter(currentStart.add(7, 'day'))) {
        weeks.push(currentWeek);
        currentWeek = [];
        currentStart = date.startOf('week');
      }
      currentWeek.push(fixture);
    });

    if (currentWeek.length) weeks.push(currentWeek);
    return weeks;
  };

  const handlePredictionChange = (fixtureId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [field]: value,
      },
    }));
  };

  const toggleBonus = (fixtureId) => {
    const weekFixtures = gameWeeks[selectedWeekIndex];
    const currentBonusCount = Object.values(bonusPicks).filter(b => b === true).length;
    const maxBonuses = Math.floor(weekFixtures.length / 5);

    if (!bonusPicks[fixtureId] && currentBonusCount >= maxBonuses) return;

    setBonusPicks(prev => ({
      ...prev,
      [fixtureId]: !prev[fixtureId],
    }));
  };

  const savePredictions = async () => {
    const weekFixtures = gameWeeks[selectedWeekIndex];

    for (const fixture of weekFixtures) {
      const prediction = predictions[fixture.id];
      if (!prediction) continue;

      const { error } = await supabase
        .from('predictions')
        .upsert({
          fixture_id: fixture.id,
          user_id: user.id,
          predicted_home_score: prediction.home,
          predicted_away_score: prediction.away,
          is_bonus: !!bonusPicks[fixture.id],
        });

      if (error) console.error('Prediction error:', error);
    }

    // Refresh points after save
    await fetchFixtures();
  };

  const week = gameWeeks[selectedWeekIndex] || [];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Predictions - Game Week {selectedWeekIndex + 1}</h1>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => setSelectedWeekIndex(i => Math.max(i - 1, 0))}
          disabled={selectedWeekIndex === 0}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setSelectedWeekIndex(i => Math.min(i + 1, gameWeeks.length - 1))}
          disabled={selectedWeekIndex === gameWeeks.length - 1}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>

      <ul className="mb-6">
        {week.map(f => (
          <li key={f.id} className="mb-4 border p-3 rounded">
            <div className="font-bold">{f.home_team} vs {f.away_team}</div>
            <div className="text-sm text-gray-600">{new Date(f.match_date).toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Home"
                value={predictions[f.id]?.home ?? ''}
                onChange={e => handlePredictionChange(f.id, 'home', e.target.value)}
                className="border p-1 w-16"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Away"
                value={predictions[f.id]?.away ?? ''}
                onChange={e => handlePredictionChange(f.id, 'away', e.target.value)}
                className="border p-1 w-16"
              />
              <label className="ml-4 flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!bonusPicks[f.id]}
                  onChange={() => toggleBonus(f.id)}
                />
                <span>Bonus</span>
              </label>
              {predictions[f.id]?.points !== undefined && (
                <span className="ml-2 text-green-600 text-sm font-semibold">
                  {predictions[f.id].points} pts
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={savePredictions}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Predictions
      </button>
    </div>
  );
  }
