import { useEffect, useState, useCallback } from 'react'; import { supabase } from '@/lib/supabaseclient'; import { useUser } from '@supabase/auth-helpers-react'; import dayjs from 'dayjs';

export default function PredictionsPage() { const user = useUser(); const [fixtures, setFixtures] = useState([]); const [gameWeeks, setGameWeeks] = useState([]); const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); const [predictions, setPredictions] = useState({}); const [bonusPicks, setBonusPicks] = useState({}); const [scores, setScores] = useState({}); const [message, setMessage] = useState('');

const fetchFixtures = useCallback(async () => { const { data: fixturesData, error: fixturesError } = await supabase .from('fixtures') .select('id, home_team, away_team, match_date, actual_home_score, actual_away_score') .order('match_date');

if (fixturesError) {
  console.error('Error fetching fixtures:', fixturesError);
  return;
}

const { data: predictionsData, error: predError } = await supabase
  .from('predictions')
  .select('fixture_id, predicted_home_score, predicted_away_score, is_bonus, points')
  .eq('user_id', user.id);

if (predError) {
  console.error('Error fetching predictions:', predError);
  return;
}

const predMap = {};
const bonusMap = {};
const scoreMap = {};

predictionsData.forEach(p => {
  predMap[p.fixture_id] = {
    home: p.predicted_home_score,
    away: p.predicted_away_score,
  };
  bonusMap[p.fixture_id] = p.is_bonus;
  scoreMap[p.fixture_id] = p.points ?? 0;
});

setPredictions(predMap);
setBonusPicks(bonusMap);
setScores(scoreMap);

const grouped = groupFixturesByWeek(fixturesData);
setGameWeeks(grouped);

}, [user]);

useEffect(() => { if (user) fetchFixtures(); }, [user, fetchFixtures]);

const groupFixturesByWeek = (fixtures) => { if (!fixtures.length) return [];

const weeks = [];
let currentWeek = [];
let currentStart = dayjs(fixtures[0].match_date);

fixtures.forEach((fixture) => {
  const date = dayjs(fixture.match_date);
  if (date.isAfter(currentStart.add(7, 'day'))) {
    weeks.push(currentWeek);
    currentWeek = [];
    currentStart = date;
  }
  currentWeek.push(fixture);
});

if (currentWeek.length) weeks.push(currentWeek);
return weeks;

};

const handlePredictionChange = (fixtureId, field, value) => { setPredictions((prev) => ({ ...prev, [fixtureId]: { ...prev[fixtureId], [field]: value, }, })); };

const toggleBonus = (fixtureId) => { const weekFixtures = gameWeeks[selectedWeekIndex]; const currentBonusCount = Object.values(bonusPicks).filter(b => b).length; const maxBonuses = Math.floor(weekFixtures.length / 5);

if (!bonusPicks[fixtureId] && currentBonusCount >= maxBonuses) return;

setBonusPicks((prev) => ({
  ...prev,
  [fixtureId]: !prev[fixtureId],
}));

};

const savePredictions = async () => { const weekFixtures = gameWeeks[selectedWeekIndex]; let allSuccess = true;

for (const fixture of weekFixtures) {
  const prediction = predictions[fixture.id];
  if (!prediction || prediction.home === '' || prediction.away === '') continue;

  const payload = {
    fixture_id: fixture.id,
    user_id: user.id,
    predicted_home_score: Number(prediction.home),
    predicted_away_score: Number(prediction.away),
    is_bonus: !!bonusPicks[fixture.id],
    submitted_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('predictions')
    .upsert(payload, {
      onConflict: ['fixture_id', 'user_id'],
    });

  if (error) {
    console.error('Error saving prediction:', error);
    allSuccess = false;
  }
}

if (allSuccess) {
  setMessage('Predictions saved!');
  fetchFixtures();
} else {
  setMessage('Error saving some predictions. Check console.');
}

setTimeout(() => setMessage(''), 3000);

};

const week = gameWeeks[selectedWeekIndex] || [];

return ( <div className="p-4 max-w-3xl mx-auto mt-6"> <h1 className="text-2xl font-bold mb-4">Predictions — Game Week {selectedWeekIndex + 1}</h1>

<div className="flex justify-between mb-4">
    <button
      onClick={() => setSelectedWeekIndex(i => Math.max(i - 1, 0))}
      disabled={selectedWeekIndex === 0}
      className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={() => setSelectedWeekIndex(i => Math.min(i + 1, gameWeeks.length - 1))}
      disabled={selectedWeekIndex === gameWeeks.length - 1}
      className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>

  {week.map(f => (
    <div key={f.id} className="mb-4 border p-3 rounded">
      <div className="font-bold">{f.home_team} vs {f.away_team}</div>
      <div className="text-sm text-gray-600">{new Date(f.match_date).toLocaleString()}</div>

      {f.actual_home_score != null && f.actual_away_score != null && (
        <div className="text-sm text-green-600 mt-1">
          Final Score: {f.actual_home_score}–{f.actual_away_score}
        </div>
      )}

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
        <span className="ml-auto text-green-600 text-sm">
          Points: {scores[f.id] ?? 0}
        </span>
      </div>
    </div>
  ))}

  <button
    onClick={savePredictions}
    className="bg-blue-600 text-white px-4 py-2 rounded w-full"
  >
    Save Predictions
  </button>

  {message && <p className="mt-2 text-green-600">{message}</p>}
</div>

); }

