import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import GameOver from './components/GameOver';
import Overview from './components/Overview';
import GrowRoom from './components/GrowRoom';
import Shop from './components/Shop';
import Finances from './components/Finances';
import StatusBar from './components/Notification';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const started     = useGameStore(s => s.started);
  const gameOver    = useGameStore(s => s.gameOver);
  const user        = useGameStore(s => s.user);
  const setUser     = useGameStore(s => s.setUser);
  const loadGame    = useGameStore(s => s.loadGame);
  const saveStatus  = useGameStore(s => s.saveStatus);

  const [tab, setTab]         = useState('overview');
  const [authReady, setAuthReady] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Listen for Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadGame();
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadGame();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 text-sm animate-pulse">Laden…</div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthScreen onGuest={() => setIsGuest(true)} />;
  }

  if (!started) return <StartScreen />;
  if (gameOver)  return <GameOver />;

  return (
    <div className="min-h-screen bg-gray-950">
      <Header tab={tab} setTab={setTab} saveStatus={saveStatus} user={user} />
      <main className="pb-14">
        {tab === 'overview'  && <Overview setTab={setTab} />}
        {tab === 'growroom'  && <GrowRoom />}
        {tab === 'shop'      && <Shop />}
        {tab === 'finances'  && <Finances />}
      </main>
      <StatusBar />
    </div>
  );
}
