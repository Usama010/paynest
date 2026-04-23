import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuctions } from '../services/api';
import type { Auction } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import AuctionForm from '../components/AuctionForm';

export default function Dashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchAuctions = useCallback(async () => {
    const data = await getAuctions();
    const sorted = data.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });
    setAuctions(sorted);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      void fetchAuctions();
    }
  }, [fetchAuctions]);

  return (
    <div>
      <AuctionForm onCreated={fetchAuctions} />
      <h2 className="text-xl font-semibold mt-6 mb-4">Auctions</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : auctions.length === 0 ? (
        <p className="text-gray-400">No auctions yet. Create one above!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}
    </div>
  );
}
