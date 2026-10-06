"use client";

import { useUsers } from "@library/api";

export default function UsersPage() {
  const { data: users = [], isLoading: loading, isError, error } = useUsers();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Module Integration</h1>

      {loading && (
        <p className="text-zinc-500 italic">Fetching users from API...</p>
      )}

      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl mb-6">
          {error instanceof Error
            ? error.message
            : "Failed to fetch users. Is the API running on port 4000?"}
        </div>
      )}

      {!loading && !isError && users.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
          <p className="text-zinc-500 mb-4">No users found in the database.</p>
          <a
            href="http://localhost:4000/swagger"
            target="_blank"
            className="text-blue-600 font-medium hover:underline"
          >
            Use Swagger to create a user →
          </a>
        </div>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-xl font-bold dark:bg-zinc-800">
                {user.firstName[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-zinc-500 text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-zinc-50 rounded-3xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Integration Details</h2>
        <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex gap-2">
            <span className="font-mono text-blue-600 font-bold">API:</span>
            <span>Connected to NestJS on port 4000</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-blue-600 font-bold">Docs:</span>
            <span>Swagger UI integrated and accessible via Navbar</span>
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-blue-600 font-bold">Types:</span>
            <span>
              Using shared DTOs from the API (simulated via any for now)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
