import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ onGuest }) {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState(null);
  const [info, setInfo]     = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !pass) return;
    setBusy(true);
    setError(null);
    setInfo(null);

    let result;
    if (mode === 'register') {
      result = await supabase.auth.signUp({ email, password: pass });
      if (!result.error) {
        setInfo('Bestätigungs-E-Mail wurde gesendet. Bitte verifiziere deine Adresse.');
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password: pass });
    }

    if (result.error) setError(result.error.message);
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🌿</div>
          <h1 className="text-2xl font-bold text-green-400 tracking-widest uppercase">GrowSim</h1>
          <p className="text-xs text-gray-500">Cannabis-Anbau-Simulator</p>
        </div>

        {/* Auth card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {[['login','Anmelden'], ['register','Registrieren']].map(([id, label]) => (
              <button key={id} onClick={() => { setMode(id); setError(null); setInfo(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                  mode === id
                    ? 'text-green-400 border-b-2 border-green-500 bg-green-950/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-green-400 bg-green-950/40 border border-green-800/50 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">E-Mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de" required autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Passwort</label>
              <input
                type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-600"
              />
            </div>

            <button type="submit" disabled={busy}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
                busy
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-600 text-white'
              }`}>
              {busy ? '…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>
        </div>

        {/* Guest option */}
        <div className="text-center">
          <button onClick={onGuest}
            className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors">
            Ohne Konto spielen (kein Speicherstand)
          </button>
        </div>
      </div>
    </div>
  );
}
