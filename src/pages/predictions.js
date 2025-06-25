'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';

export default function PredictionsPage() {
  const [fixtures, setFixtures] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [savedPredictions, setSavedPredictions] = useState({});
  const [user, setUser] = useState(null);

  // Get logged-in user
  useEffect(() => {
    const checkUser = async () => {
      const result = await supabase.auth.getUser();
      setUser(result?.data?.user ?? null);
    };
    checkUser();
  }, []);

  // Load fixtures
  useEffect(() => {
    const fetchFixtures = async () => {
      const now = new Date().toISOString();
      const result = await supabase
        .from('fixtures')
        .select('*')
        .gt('match_date', now)
        .order('match_date', { ascending: true });

      if (!result.error) {
        setFixtures(result.data || []);
      }
    };
    fetchFixtures();
  }, []);

  // Load saved predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return;

      const result = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id);

      if (!result.error && result.data) {
        const map = {};
        for (const p of result.data) {
          map[p.fixture_id] = p;
        }
        setSavedPredictions(map);
      }
    };
    fetchPredictions();
  }, [user]);

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

  const handleBonusToggle = (fixtureId) => {
    const current = predictions[fixtureId]?.is_bonus || false;
    const updated = {
      ...predictions,
      [fixtureId]: {
        ...predictions[fixtureId],
        is_bonus: !current,
      },
    };

    const bonusCount = Object.values(updated).filter(p => p.is_bonus).length;
    if (bonusCount > Math.floor(fixtures.length / 5)) {
      alert('You can only select one bonus prediction for every five games.');
      return;
    }

    setPredictions(updated);
  };

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

    const result = await supabase.from('predictions').upsert({
      fixture_id: fixtureId,
      user_id: user.id,
      predicted_home_score: parseInt(p.home),
      predicted_away_score: parseInt(p.away),
      is_bonus: p.is_bonus || false,
    }, {
      onConflict: ['user_id', 'fixture_id'],
    });

    if (result.error) {
      alert('Error saving prediction: ' + result.error.message);
    } else {
      alert('Prediction saved!');
      setSavedPredictions(prev => ({
        ...prev,
        [fixtureId]: {
          fixture_id: fixtureId,
          predicted_home_score: parseInt(p.home),
          predicted_away_score: parseInt(p.away),
          is_bonus: p.is_bonus || false,
