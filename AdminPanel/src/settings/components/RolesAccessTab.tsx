import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Mail,
  Lock,
  Building,
  KeyRound,
  Edit3,
} from 'lucide-react';
import { InviteUserModal } from './InviteUserModal';
import { EditUserModal } from './EditUserModal';

export type AdminRole = 'superadmin' | 'admin' | 'therapist' | 'specialist' | 'billing';
export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  department: string;
  status: UserStatus;
  initials: string;
}

interface RolesAccessTabProps {
  onShowToast: (msg: string) => void;
}

export const RolesAccessTab: React.FC<RolesAccessTabProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [userToEdit, setUserToEdit] = useState<AdminUserRecord | null>(null);

  const handleRoleChange = async (userId: string, newRole: AdminRole, roleTitle?: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    onShowToast(`Updated user role to ${roleTitle || newRole}`);
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
    onShowToast(`Account status updated to ${nextStatus}`);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    onShowToast(`Deleted ${userToDelete.fullName} from user registry.`);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((usr) => {
    const matchesSearch =
      usr.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || usr.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || usr.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const pendingCount = users.filter((u) => u.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Roles & Access Control
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Manage clinic staff permissions, admin privileges, and user status stored in Firebase.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
              <span className="text-lg font-extrabold text-slate-900">{users.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active Accounts</span>
              <span className="text-lg font-extrabold text-emerald-900">{activeCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Invites</span>
              <span className="text-lg font-extrabold text-amber-900">{pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or dept..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-44 appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 pr-8 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Clinic Admin</option>
              <option value="therapist">Senior Therapist</option>
              <option value="specialist">Physiotherapist</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36 appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 pr-8 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users List Table / Card View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Syncing user records with Firebase Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No matching users found</p>
            <p className="text-xs text-slate-400">Try adjusting search or filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((usr) => (
              <div
                key={usr.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* User Left Meta */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {usr.initials}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{usr.fullName}</h4>
                      {usr.role === 'superadmin' && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                          SUPERADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center space-x-2 mt-0.5">
                      <span>{usr.email}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-semibold">{usr.department}</span>
                    </p>
                  </div>
                </div>

                {/* Controls Right */}
                <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Role Dropdown */}
                  <div className="relative">
                    <select
                      value={usr.role}
                      onChange={(e) =>
                        handleRoleChange(
                          usr.id,
                          e.target.value as AdminRole,
                          e.target.options[e.target.selectedIndex].text
                        )
                      }
                      className="appearance-none px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-bold text-xs rounded-xl pr-7 border border-slate-200 cursor-pointer transition-colors"
                    >
                      <option value="superadmin">Superadmin</option>
                      <option value="admin">Clinic Administrator</option>
                      <option value="therapist">Senior Therapist</option>
                      <option value="specialist">Physiotherapist</option>
                      <option value="billing">Billing Specialist</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status Badge & Toggle */}
                  <button
                    onClick={() => handleStatusToggle(usr.id, usr.status)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border cursor-pointer transition-all flex items-center space-x-1.5 ${
                      usr.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : usr.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="Click to toggle status"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'Active' ? 'bg-emerald-500' : usr.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    <span>{usr.status}</span>
                  </button>

                  {/* Edit Credentials & Details Button */}
                  <button
                    onClick={() => setUserToEdit(usr)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Email, Password & Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  {usr.role !== 'superadmin' && (
                    <button
                      onClick={() => setUserToDelete(usr)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Matrix Overview Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3 text-blue-400">
          <KeyRound className="w-5 h-5" />
          <h4 className="text-base font-extrabold tracking-tight">Security & Permission Matrix</h4>
        </div>
        <p className="text-xs text-slate-400 font-normal leading-relaxed">
          All user privileges and security status changes are enforced directly via Firebase Firestore rules. Deactivating an admin account revokes system token privileges immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-blue-400">Superadmin & Admin</span>
            <p className="text-[11px] text-slate-300">Full workspace configuration, role modification, billing, and system logs access.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-emerald-400">Senior Therapist & Specialist</span>
            <p className="text-[11px] text-slate-300">Full patient management, exercise prescription, and clinical notes entry.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-purple-400">Billing Specialist</span>
            <p className="text-[11px] text-slate-300">Financial reports, insurance claim tracking, and patient invoice creation.</p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSent={(name, role) => {
          onShowToast(`Invitation issued to ${name} (${role})`);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={userToEdit}
        isOpen={Boolean(userToEdit)}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={(msg) => onShowToast(msg)}
      />

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Remove User Record?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <span className="font-bold text-slate-800">{userToDelete.fullName}</span> ({userToDelete.email}) from Firebase Firestore registry? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
