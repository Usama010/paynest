import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getUsers } from '../services/api';
import type { User } from '../services/api';

interface UserContextType {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  users: [],
  selectedUser: null,
  setSelectedUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data);
      const savedId = localStorage.getItem('selectedUserId');
      const saved = data.find((u) => u.id === savedId);
      if (saved) setSelectedUser(saved);
      setLoading(false);
    });
  }, []);

  const handleSetUser = (user: User | null) => {
    setSelectedUser(user);
    if (user) localStorage.setItem('selectedUserId', user.id);
    else localStorage.removeItem('selectedUserId');
  };

  return (
    <UserContext.Provider
      value={{ users, selectedUser, setSelectedUser: handleSetUser, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  return useContext(UserContext);
}
