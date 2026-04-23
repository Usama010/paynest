import { useState, type FormEvent } from 'react';
import { createAuction } from '../services/api';

interface Props {
  onCreated: () => void;
}

export default function AuctionForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAuction({
        name,
        description,
        startingPriceCents: Math.round(parseFloat(startingPrice) * 100),
        durationSeconds: parseInt(durationMinutes) * 60,
      });
      setName('');
      setDescription('');
      setStartingPrice('');
      setDurationMinutes('');
      onCreated();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-3">Create Auction</h2>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Starting price ($)"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
          required
          min="1"
          step="0.01"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
          min="1"
          max="1440"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Auction'}
      </button>
    </form>
  );
}
