import { Link } from 'react-router-dom';
import type { Auction } from '../services/api';
import { formatCents } from '../utils/format';
import CountdownTimer from './CountdownTimer';

export default function AuctionCard({ auction }: { auction: Auction }) {
  const hasNoBids = auction.currentHighestBidCents === 0;

  return (
    <Link
      to={`/auction/${auction.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow no-underline text-inherit"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">{auction.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            auction.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {auction.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {auction.description}
      </p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-400">
            {hasNoBids ? 'Starting price' : 'Current bid'}
          </p>
          <p className="text-lg font-bold text-indigo-600">
            {hasNoBids
              ? formatCents(auction.startingPriceCents)
              : formatCents(auction.currentHighestBidCents)}
          </p>
        </div>
        <CountdownTimer endTime={auction.endTime} />
      </div>
    </Link>
  );
}
