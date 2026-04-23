import { useState } from 'react';
import { placeBid, getUsers } from '../services/api';
import type { User } from '../services/api';
import { formatCents } from '../utils/format';
import { useEffect } from 'react';

interface Props {
  auctionId: string;
  currentHighestBidCents: number;
  startingPriceCents: number;
  isEnded: boolean;
}

interface RaceResult {
  user: string;
  status: 'success' | 'rejected';
  message: string;
}

export default function RaceConditionTest({
  auctionId,
  currentHighestBidCents,
  startingPriceCents,
  isEnded,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [user1Id, setUser1Id] = useState('');
  const [user2Id, setUser2Id] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const minimumCents =
    currentHighestBidCents > 0
      ? currentHighestBidCents + 100
      : startingPriceCents;

  const handleRaceTest = async () => {
    if (!user1Id || !user2Id || !bidAmount) return;
    setLoading(true);
    setResults([]);

    const amountCents = Math.round(parseFloat(bidAmount) * 100);

    const [res1, res2] = await Promise.allSettled([
      placeBid(auctionId, { userId: user1Id, amountCents }),
      placeBid(auctionId, { userId: user2Id, amountCents }),
    ]);

    const user1Name = users.find((u) => u.id === user1Id)?.displayName ?? 'User 1';
    const user2Name = users.find((u) => u.id === user2Id)?.displayName ?? 'User 2';

    const newResults: RaceResult[] = [];

    if (res1.status === 'fulfilled') {
      newResults.push({ user: user1Name, status: 'success', message: `Bid of ${formatCents(amountCents)} accepted` });
    } else {
      const err = res1.reason as { response?: { data?: { message?: string } } };
      newResults.push({ user: user1Name, status: 'rejected', message: err.response?.data?.message || 'Bid rejected' });
    }

    if (res2.status === 'fulfilled') {
      newResults.push({ user: user2Name, status: 'success', message: `Bid of ${formatCents(amountCents)} accepted` });
    } else {
      const err = res2.reason as { response?: { data?: { message?: string } } };
      newResults.push({ user: user2Name, status: 'rejected', message: err.response?.data?.message || 'Bid rejected' });
    }

    setResults(newResults);
    setLoading(false);
    setBidAmount('');
  };

  if (isEnded) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="font-semibold text-amber-900">Race Condition Test</h3>
        </div>
        <span className="text-amber-600 text-sm">{expanded ? 'Hide' : 'Show'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-amber-700">
            Select two users and submit the same bid simultaneously. The backend uses pessimistic locking —
            only one bid will succeed, the other will be rejected.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">User A</label>
              <select
                value={user1Id}
                onChange={(e) => setUser1Id(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} disabled={u.id === user2Id}>
                    {u.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">User B</label>
              <select
                value={user2Id}
                onChange={(e) => setUser2Id(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} disabled={u.id === user1Id}>
                    {u.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Bid Amount (both users bid the same) — Min: {formatCents(minimumCents)}
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`$${(minimumCents / 100).toFixed(2)}`}
              step="0.01"
              min={(minimumCents / 100).toFixed(2)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleRaceTest}
            disabled={loading || !user1Id || !user2Id || !bidAmount}
            className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Firing simultaneous bids...
              </span>
            ) : (
              'Fire Both Bids Simultaneously'
            )}
          </button>

          {results.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Results</p>
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                    r.status === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <span className="text-lg">{r.status === 'success' ? '✅' : '❌'}</span>
                  <div>
                    <span className="font-semibold">{r.user}:</span> {r.message}
                  </div>
                </div>
              ))}
              <p className="text-xs text-amber-700 italic">
                {results.filter((r) => r.status === 'success').length === 1
                  ? 'Pessimistic locking worked correctly — only one bid was accepted!'
                  : results.filter((r) => r.status === 'success').length === 0
                    ? 'Both bids were rejected — the amount may be too low.'
                    : 'Both succeeded — they may have been processed sequentially with different amounts.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
