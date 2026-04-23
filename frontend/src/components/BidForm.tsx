import { useState, type FormEvent } from 'react';
import { placeBid } from '../services/api';
import { useUser } from '../context/UserContext';
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
  const isCurrentHighest = selectedUser?.id === highestBidderId;
  const minimumCents =
    currentHighestBidCents > 0
      ? currentHighestBidCents + 100
      : startingPriceCents;

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to place bid');
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
      <p className="text-sm text-gray-500 mb-3">
        Minimum bid: <span className="font-medium text-indigo-600">{formatCents(minimumCents)}</span>
      </p>
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
