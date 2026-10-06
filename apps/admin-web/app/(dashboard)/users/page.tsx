"use client";

import { useState, useEffect } from "react";
import {
  useUsers,
  useCreateUser,
} from "@library/api";
import { SharedPagination } from "@library/ui";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";


export default function AdminUsersPage() {
  const { t } = useTranslation();

  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userCreateSuccess, setUserCreateSuccess] = useState("");
  const [userCreateError, setUserCreateError] = useState("");

  const { data: users, refetch: refetchUsers } = useUsers();
  const createUserMutation = useCreateUser();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreateSuccess("");
    setUserCreateError("");

    createUserMutation.mutate(
      {
        email: userEmail,
        password: userPassword,
        firstName: userFirstName,
        lastName: userLastName,
      },
      {
        onSuccess: () => {
          setUserCreateSuccess("User account created successfully!");
          setUserFirstName("");
          setUserLastName("");
          setUserEmail("");
          setUserPassword("");
          refetchUsers();
          setTimeout(() => setUserCreateSuccess(""), 3000);
        },
        onError: (err: unknown) => {
          const errResponse = err as { response?: { data?: { message?: string } } };
          setUserCreateError(errResponse.response?.data?.message || "Error creating user account.");
        },
      }
    );
  };

  const filteredUsersList = users?.filter(usr => {
    const name = `${usr.firstName || ''} ${usr.lastName || ''}`.toLowerCase();
    const email = (usr.email || '').toLowerCase();
    const role = (usr.role?.name || '').toLowerCase();
    const query = userSearch.toLowerCase();
    return name.includes(query) || email.includes(query) || role.includes(query);
  }) || [];
  
  const paginatedUsers = filteredUsersList.slice((userPage - 1) * userPageSize, userPage * userPageSize);
  const totalUserPages = Math.ceil(filteredUsersList.length / userPageSize) || 1;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">System User Accounts</h3>
        <p className="text-zinc-555 text-xs">Manage credential roles and active member directories in the library.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Create User Form - "users create by admin only" */}
        <div className="md:col-span-5 p-6 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4 self-start">
          <div>
            <h4 className="font-bold text-sm text-white">Register Reader</h4>
            <p className="text-zinc-500 text-[10px] mt-0.5">Note: Reader accounts are created by Admin staff only.</p>
          </div>

          {userCreateSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl text-center">
              ✨ {userCreateSuccess}
            </div>
          )}

          {userCreateError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
              ⚠️ {userCreateError}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="Fiona"
                  value={userFirstName}
                  onChange={(e) => setUserFirstName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs outline-none text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Goi"
                  value={userLastName}
                  onChange={(e) => setUserLastName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs outline-none text-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="fiona@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs outline-none text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-[10px] font-bold uppercase mb-1">Initial Password (Min 6)</label>
              <div className="relative">
                <input
                  type={showUserPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 focus:border-red-500 rounded-xl pl-3 pr-10 py-2 text-xs outline-none text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(!showUserPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer bg-transparent border-none"
                  title={showUserPassword ? "Hide password" : "Show password"}
                >
                  {showUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-xs cursor-pointer border-none outline-none"
            >
              Register Account
            </button>
          </form>
        </div>

        {/* Users List Table */}
        <div className="md:col-span-7 space-y-4">
          {/* Sleek Search Bar */}
          <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-2xl px-4 py-3 flex items-center gap-3">
            <svg className="w-4 h-4 text-zinc-550" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-550 w-full"
            />
            {userSearch && (
              <button onClick={() => setUserSearch("")} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold px-1 cursor-pointer bg-transparent border-none">
                Clear
              </button>
            )}
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-zinc-900/50 border-b border-zinc-850 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Account Member</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic bg-zinc-900/10">
                        No matching member accounts found in user records.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-zinc-900/10 transition-all">
                        <td className="px-6 py-4 text-left">
                          <div className="font-extrabold text-white">{usr.firstName} {usr.lastName}</div>
                          <div className="text-zinc-500">{usr.email}</div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <span className="text-[10px] text-red-400 font-extrabold uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            {usr.role?.name || "USER"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-left">{new Date(usr.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <SharedPagination
              page={userPage}
              setPage={setUserPage}
              pageSize={userPageSize}
              setPageSize={setUserPageSize}
              totalItems={filteredUsersList?.length || 0}
              totalPages={totalUserPages}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
