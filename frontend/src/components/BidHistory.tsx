import type { Bid } from '../services/api';
import { formatCents } from '../utils/format';

export default function BidHistory({ bids }: { bids: Bid[] }) {
  if (bids.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No bids yet</p>;
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {bids.map((bid, i) => (
        <div
          key={bid.id}
          className={`flex justify-between items-center p-2 rounded text-sm ${
            i === 0 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
          }`}
        >
          <span className="text-gray-700">
            {bid.user?.displayName ?? 'Unknown'}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-indigo-600">
              {formatCents(bid.amountCents)}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(bid.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
