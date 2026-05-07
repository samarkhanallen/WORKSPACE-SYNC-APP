import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AppUser } from '../types';
import { Users, Mail, Shield, ShieldAlert, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

export default function Team() {
  const { profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersPath = 'users';
    // Only admins can list users technically, but for this demo we'll let members see the team
    const usersQuery = query(collection(db, usersPath), orderBy('displayName', 'asc'));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as AppUser));
      setLoading(false);
    }, (error) => {
      // If permission denied, we'll just show the current user at least
      if (error.message.includes('permission-denied') && profile) {
        setUsers([profile]);
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, usersPath);
      }
    });

    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workspace Team</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage your team members and roles.</p>
      </div>

      <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400">Loading team members...</td>
                </tr>
              ) : users.map((user, i) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={user.uid}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-100">
                        {user.displayName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      user.role === 'admin' ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500"
                    )}>
                      {user.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-gray-400 font-medium">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:bg-white hover:text-black rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
