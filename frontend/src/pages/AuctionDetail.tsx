import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuction } from '../services/api';
import type { Auction, Bid } from '../services/api';
import { useAuctionSocket } from '../hooks/useSocket';
import { formatCents } from '../utils/format';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isEnded, setIsEnded] = useState(false);
  const [winner, setWinner] = useState<{ name: string; amount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAuction(id).then((data) => {
      setAuction(data);
      setBids(data.bids || []);
      setIsEnded(data.status === 'closed' || new Date(data.endTime) <= new Date());
      if (data.status === 'closed' && data.highestBidder) {
        setWinner({
          name: data.highestBidder.displayName,
          amount: data.currentHighestBidCents,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const onNewBid = useCallback(
    (data: { amountCents: number; userId: string; username: string; timestamp: string }) => {
      setAuction((prev) =>
        prev
          ? { ...prev, currentHighestBidCents: data.amountCents, highestBidderId: data.userId }
          : prev,
      );
      setBids((prev) => [
        {
          id: crypto.randomUUID(),
          auctionId: id!,
          userId: data.userId,
          amountCents: data.amountCents,
          createdAt: data.timestamp,
          user: { id: data.userId, username: '', displayName: data.username },
        },
        ...prev,
      ]);
    },
    [id],
  );

  const onAuctionEnded = useCallback(
    (data: { winnerName: string | null; winningBidCents: number }) => {
      setIsEnded(true);
      setAuction((prev) => (prev ? { ...prev, status: 'closed' } : prev));
      if (data.winnerName) {
        setWinner({ name: data.winnerName, amount: data.winningBidCents });
      }
    },
    [],
  );

  useAuctionSocket(id, { onNewBid, onAuctionEnded });

  if (loading || !auction) {
    return <p className="text-gray-400 text-center mt-10">Loading...</p>;
  }

  return (
    <div>
      <Link to="/" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        &larr; Back to auctions
      </Link>

      {winner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
          <p className="text-green-700 font-semibold text-lg">
            Winner: {winner.name} with {formatCents(winner.amount)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{auction.name}</h1>
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
            <p className="text-gray-500 mb-4">{auction.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Starting Price</p>
                <p className="text-lg font-semibold">
                  {formatCents(auction.startingPriceCents)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Current Highest Bid</p>
                <p className="text-lg font-bold text-indigo-600">
                  {auction.currentHighestBidCents > 0
                    ? formatCents(auction.currentHighestBidCents)
                    : 'No bids yet'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Time Remaining</p>
                <CountdownTimer endTime={auction.endTime} />
              </div>
            </div>
          </div>

          <BidForm
            auctionId={auction.id}
            currentHighestBidCents={auction.currentHighestBidCents}
            startingPriceCents={auction.startingPriceCents}
            highestBidderId={auction.highestBidderId}
            isEnded={isEnded}
          />
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Bid History ({bids.length})</h3>
            <BidHistory bids={bids} />
          </div>
        </div>
      </div>
    </div>
  );
}
