import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';

export default function Predictions() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [savedPredictions, setSavedPredictions] = useState({});
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get logged-in user
  useEffect(() => {
    if (!isClient) return;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [isClient]);

  // Load fixtures
  useEffect(() => {
    if (!isClient) return;

    const fetchFixtures = async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .gt('match_date', new Date().toISOString())
        .order('match_date', { ascending: true });

      if (!error) setFixtures(data || []);
    };
    fetchFixtures();
  }, [isClient]);

  // Load saved predictions
  useEffect(() => {
    if (!user || !isClient) return;

    const fetchPredictions = async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        const map = {};
        for (const p of data) {
          map[p.fixture_id] = p;
        }
        setSavedPredictions(map);
      }
    };
    fetchPredictions();
  }, [user, isClient]);

  // Handle input change
  const handleInput = (fixtureId, team, value) => {
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [team]: value,
        is_bonus: prev[fixtureId]?.is_bonus ?? false,
      },
    }));
  };

  // Handle bonus toggle
  const handleBonusToggle = (fixtureId) => {
    const current = predictions[fixtureId]?.is_bonus || false;
    const newPredictions = {
      ...predictions,
      [fixtureId]: {
        ...predictions[fixtureId],
        is_bonus: !current,
      },
    };

    const bonusCount = Object.values(newPredictions).filter(p => p.is_bonus).length;
    const maxBonuses = Math.floor(fixtures.length / 5);
    if (bonusCount > maxBonuses) {
      alert(`You can only select one bonus prediction for every five games.`);
      return;
    }

    setPredictions(newPredictions);
  };

  // Submit prediction
  const handleSubmit = async (fixtureId) => {
    if (!user) {
      alert('You must be logged in to submit predictions.');
      return;
    }

    const p = predictions[fixtureId];
    if (!p?.home || !p?.away) {
      alert('Please enter both scores.');
      return;
    }

    const { error } = await supabase
      .from('predictions')
      .upsert({
        fixture_id: fixtureId,
        user_id: user.id,
        predicted_home_score: parseInt(p.home),
        predicted_away_score: parseInt(p.away),
        is_bonus: p.is_bonus || false,
      }, { onConflict: ['user_id', 'fixture_id'] });

    if (error) {
      alert('Error saving prediction: ' + error.message);
    } else {
      alert('Prediction saved!');
      setSavedPredictions(prev => ({
        ...prev,
        [fixtureId]: {
          fixture_id: fixtureId,
          predicted_home_score: parseInt(p.home),
          predicted_away_score: parseInt(p.away),
          is_bonus: p.is_bonus || false,
        },
      }));
    }
  };

  if (!isClient) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Your Predictions</h1>
      {fixtures.length === 0 && <p>No fixtures found.</p>}

      {fixtures.map(fixture => {
        const saved = savedPredictions[fixture.id];
        const current = predictions[fixture.id] || {};
        const matchDate = new Date(fixture.match_date);
        const locked = matchDate < new Date();

        return (
          <div key={fixture.id} className="mb-6 border p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">
              {fixture.home_team} vs {fixture.away_team}
            </h2>
            <p className="text-sm mb-2 text-gray-500">
              {matchDate.toLocaleString()}
            </p>

            {saved && (
              <p className="text-sm text-green-600 mb-2">
                Saved: {saved.predicted_home_score} - {saved.predicted_away_score}
                {saved.is_bonus ? ' ⭐ (Bonus)' : ''}
              </p>
            )}

            {locked ? (
              <p className="text-red-600 font-bold">Predictions are locked</p>
            ) : (
              <>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    placeholder="Home score"
                    className="border p-2 w-24"
                    onChange={e => handleInput(fixture.id, 'home', e.target.value)}
                    value={current.home || ''}
                  />
                  <input
                    type="number"
                    placeholder="Away score"
                    className="border p-2 w-24"
                    onChange={e => handleInput(fixture.id, 'away', e.target.value)}
                    value={current.away || ''}
                  />
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={current.is_bonus || false}
                      onChange={() => handleBonusToggle(fixture.id)}
                    />
                    <span>Bonus</span>
                  </label>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => handleSubmit(fixture.id)}
                >
                  Submit Prediction
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
