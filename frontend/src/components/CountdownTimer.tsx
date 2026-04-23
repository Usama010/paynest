import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '../utils/format';

export default function CountdownTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState(() => formatTimeRemaining(endTime));
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      setRemaining(formatTimeRemaining(endTime));
      setSecondsLeft(Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const isEnded = remaining === 'Ended';
  const isUrgent = !isEnded && secondsLeft <= 30;
  const isCritical = !isEnded && secondsLeft <= 10;

  return (
    <span
      className={`font-mono text-sm font-semibold ${
        isEnded
          ? 'text-red-600'
          : isCritical
            ? 'text-red-600 animate-pulse'
            : isUrgent
              ? 'text-orange-500 animate-[pulse_2s_ease-in-out_infinite]'
              : 'text-green-600'
      }`}
    >
      {isEnded ? 'Ended' : remaining}
    </span>
  );
}
