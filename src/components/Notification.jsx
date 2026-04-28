import { useGameStore } from '../store/gameStore';

const typeStyle = {
  info: 'bg-blue-900/80 border-blue-500 text-blue-200',
  success: 'bg-green-900/80 border-green-500 text-green-200',
  error: 'bg-red-900/80 border-red-500 text-red-200',
  warn: 'bg-yellow-900/80 border-yellow-500 text-yellow-200',
};

export default function Notifications() {
  const notifications = useGameStore(s => s.notifications);
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded border text-xs font-mono shadow-lg ${typeStyle[n.type] || typeStyle.info}`}
        >
          {n.msg}
        </div>
      ))}
    </div>
  );
}
