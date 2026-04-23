import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuctions } from '../services/api';
import type { Auction } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import AuctionForm from '../components/AuctionForm';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../components/Toast';
import { useGlobalSocket } from '../hooks/useSocket';

export default function Dashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const hasFetched = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  const fetchAuctions = useCallback(async (p = page, s = status, q = search) => {
    setLoading(true);
    const result = await getAuctions({
      page: p,
      limit: 12,
      status: s || undefined,
      search: q || undefined,
    });
    setAuctions(result.data);
    setTotalPages(result.totalPages);
    setTotal(result.total);
    setLoading(false);
  }, [page, status, search]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      void fetchAuctions(1, '', '');
    }
  }, [fetchAuctions]);

  useGlobalSocket({
    onNewBid: (data) => {
      addToast(`New bid of $${(data.amountCents / 100).toFixed(2)} by ${data.username}`, 'info');
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId
            ? { ...a, currentHighestBidCents: data.amountCents, highestBidderId: data.userId }
            : a,
        ),
      );
    },
    onAuctionEnded: (data) => {
      if (data.winnerName) {
        addToast(`Auction ended! Winner: ${data.winnerName}`, 'success');
      }
      setAuctions((prev) =>
        prev.map((a) => (a.id === data.auctionId ? { ...a, status: 'closed' as const } : a)),
      );
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    void fetchAuctions(1, newStatus, search);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      void fetchAuctions(1, status, value);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void fetchAuctions(newPage, status, search);
  };

  const handleCreated = () => {
    setPage(1);
    setStatus('');
    setSearch('');
    setSearchInput('');
    void fetchAuctions(1, '', '');
    addToast('Auction created successfully!', 'success');
  };

  return (
    <div>
      <AuctionForm onCreated={handleCreated} />

      <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">
          Auctions {total > 0 && <span className="text-sm text-gray-400 font-normal">({total})</span>}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search auctions..."
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 sm:w-48"
          />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No auctions found</p>
          <p className="text-gray-300 text-sm mt-1">
            {search || status ? 'Try adjusting your filters' : 'Create one above!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctions.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`dots-${i}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 text-sm border rounded-md ${
                        p === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
