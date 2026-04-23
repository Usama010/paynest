import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import UserSelector from './UserSelector';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600 no-underline">
            PayNest
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Bidding as:</span>
            <UserSelector />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
