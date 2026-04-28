import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import GameOver from './components/GameOver';
import Overview from './components/Overview';
import GrowRoom from './components/GrowRoom';
import ClimatePanel from './components/ClimatePanel';
import Shop from './components/Shop';
import Finances from './components/Finances';
import Notifications from './components/Notification';

export default function App() {
  const started = useGameStore(s => s.started);
  const gameOver = useGameStore(s => s.gameOver);
  const [tab, setTab] = useState('overview');

  if (!started) return <StartScreen />;
  if (gameOver) return <GameOver />;

  return (
    <div className="min-h-screen bg-gray-950">
      <Header tab={tab} setTab={setTab} />
      <main>
        {tab === 'overview' && <Overview setTab={setTab} />}
        {tab === 'growroom' && <GrowRoom />}
        {tab === 'climate' && <ClimatePanel />}
        {tab === 'shop' && <Shop />}
        {tab === 'finances' && <Finances />}
      </main>
      <Notifications />
    </div>
  );
}
