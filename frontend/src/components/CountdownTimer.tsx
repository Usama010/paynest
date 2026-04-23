import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '../utils/format';

export default function CountdownTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState(() => formatTimeRemaining(endTime));

  useEffect(() => {
    const tick = () => setRemaining(formatTimeRemaining(endTime));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const isEnded = remaining === 'Ended';

  return (
    <span
      className={`font-mono text-sm font-semibold ${isEnded ? 'text-red-600' : 'text-green-600'}`}
    >
      {isEnded ? 'Ended' : remaining}
    </span>
  );
}
