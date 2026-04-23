import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuctionDetail from './pages/AuctionDetail';

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </UserProvider>
  );
}
