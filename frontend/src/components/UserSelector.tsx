import { useUser } from '../context/UserContext';

export default function UserSelector() {
  const { users, selectedUser, setSelectedUser } = useUser();

  return (
    <select
      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
      value={selectedUser?.id || ''}
      onChange={(e) => {
        const user = users.find((u) => u.id === e.target.value) || null;
        setSelectedUser(user);
      }}
    >
      <option value="">Select a user</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.displayName}
        </option>
      ))}
    </select>
  );
}
