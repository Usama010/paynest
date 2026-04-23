import { useState, type FormEvent } from 'react';
import { placeBid } from '../services/api';
import { useUser } from '../context/UserContext';
import { useToast } from './Toast';
import { formatCents } from '../utils/format';

interface Props {
  auctionId: string;
  currentHighestBidCents: number;
  startingPriceCents: number;
  highestBidderId: string | null;
  isEnded: boolean;
}

export default function BidForm({
  auctionId,
  currentHighestBidCents,
  startingPriceCents,
  highestBidderId,
  isEnded,
}: Props) {
  const { selectedUser } = useUser();
  const { addToast } = useToast();
  const isCurrentHighest = selectedUser?.id === highestBidderId;
  const minimumCents =
    currentHighestBidCents > 0
      ? currentHighestBidCents + 100
      : startingPriceCents;

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickBids = [
    { label: 'Min', cents: minimumCents },
    { label: '+$5', cents: minimumCents + 500 },
    { label: '+$10', cents: minimumCents + 1000 },
    { label: '+$50', cents: minimumCents + 5000 },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');
    setLoading(true);
    try {
      await placeBid(auctionId, {
        userId: selectedUser.id,
        amountCents: Math.round(parseFloat(amount) * 100),
      });
      setAmount('');
      addToast(`Bid of $${parseFloat(amount).toFixed(2)} placed!`, 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; statusCode?: number } } };
      if (axiosErr.response?.data?.statusCode === 429) {
        setError('Too many requests — slow down!');
        addToast('Too many requests — slow down!', 'error');
      } else {
        setError(axiosErr.response?.data?.message || 'Failed to place bid');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isEnded) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 font-medium">
        Auction has ended
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold mb-2">Place a Bid</h3>
      <p className="text-sm text-gray-500 mb-2">
        Minimum bid: <span className="font-medium text-indigo-600">{formatCents(minimumCents)}</span>
      </p>

      <div className="flex gap-1.5 mb-3">
        {quickBids.map((qb) => (
          <button
            key={qb.label}
            type="button"
            onClick={() => setAmount((qb.cents / 100).toFixed(2))}
            disabled={!selectedUser || isCurrentHighest}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition-colors"
          >
            {qb.label} ({formatCents(qb.cents)})
          </button>
        ))}
      </div>

      {!selectedUser && (
        <p className="text-sm text-amber-600 mb-3">Select a user to place bids</p>
      )}
      {isCurrentHighest && (
        <p className="text-sm text-amber-600 mb-3">You are already the highest bidder</p>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>
      )}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder={`$${(minimumCents / 100).toFixed(2)}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min={(minimumCents / 100).toFixed(2)}
          required
          disabled={!selectedUser || loading || isCurrentHighest}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={!selectedUser || loading || isCurrentHighest}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Bidding...' : 'Place Bid'}
        </button>
      </div>
    </form>
  );
}
