import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { useUser } from '@supabase/auth-helpers-react';
import dayjs from 'dayjs';

export default function PredictionsPage() {
  const user = useUser();
  const [gameWeeks, setGameWeeks] = useState([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [bonusPicks, setBonusPicks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchFixtures();
    }
  }, [user]);

  const fetchFixtures = async () => {
    setLoading(true);
    const { data: fixturesData, error } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date');

    if (error) {
      console.error('Error fetching fixtures:', error);
      setLoading(false);
      return;
    }

    const grouped = groupFixturesByWeek(fixturesData);
    setGameWeeks(grouped);

    // Optionally pre-fill predictions from DB
    const { data: existingPreds, error: predsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);

    if (predsError) {
      console.error('Error fetching predictions:', predsError);
      setLoading(false);
      return;
    }

    const predsMap = {};
    const bonusMap = {};
    existingPreds.forEach(pred => {
      predsMap[pred.fixture_id] = {
        home: pred.predicted_home_score,
        away: pred.predicted_away_score,
        points_awarded: pred.points_awarded || null,
      };
      bonusMap[pred.fixture_id] = pred.is_bonus;
    });

    setPredictions(predsMap);
    setBonusPicks(bonusMap);
    setLoading(false);
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
        [field]: value !== '' ? parseInt(value, 10) : '',
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
      if (!prediction || prediction.home === '' || prediction.away === '') continue;

      const { error } = await supabase
        .from('predictions')
        .upsert({
          fixture_id: fixture.id,
          user_id: user.id,
          predicted_home_score: parseInt(prediction.home, 10),
          predicted_away_score: parseInt(prediction.away, 10),
          is_bonus: !!bonusPicks[fixture.id],
        });

      if (error) console.error('Prediction save error:', error);
    }

    await fetchFixtures();
  };

  const week = gameWeeks[selectedWeekIndex] || [];

  if (loading) {
    return <div className="p-4 text-center">Loading fixtures...</div>;
  }

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
            </div>
            {predictions[f.id]?.points_awarded !== null && predictions[f.id]?.points_awarded !== undefined && (
              <div className="text-green-600 text-sm mt-1">Points: {predictions[f.id].points_awarded}</div>
            )}
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
