import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  Plus,
  Download,
  Filter,
  ChevronDown,
  MoreVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  UserCheck,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
} from 'lucide-react';
import type { Therapist, TherapistFilters, AvailabilityStatus, TherapistStatus } from './types';
import { AddTherapistModal } from './AddTherapistModal';
import { AddTherapistPage } from './AddTherapistPage';
import { TherapistDetailModal } from './TherapistDetailModal';
import { TherapistProfilePage } from './TherapistProfilePage';
import {
  subscribeToTherapists,
  deleteTherapistRecord,
  toggleTherapistStatus,
  seedDemoTherapistsIfEmpty,
  createTherapistRecord,
} from '@/services/therapistService';

interface TherapistsViewProps {
  onNavigateToAddTherapist?: () => void;
  onSelectTherapist?: (therapist: Therapist) => void;
}

export const TherapistsView: React.FC<TherapistsViewProps> = ({
  onNavigateToAddTherapist,
  onSelectTherapist,
}) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [profileTherapist, setProfileTherapist] = useState<Therapist | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Filters state
  const [filters, setFilters] = useState<TherapistFilters>({
    searchQuery: '',
    specialization: 'all',
    status: 'all',
    sortBy: 'name_asc',
    viewMode: 'table',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ── Real-time Firestore subscription ────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToTherapists(
      (data) => {
        setTherapists(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('TherapistsView subscription error:', err);
        setError('Failed to connect to Firestore. Check your network or Firebase config.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handler = () => setActiveMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // ── Add new therapist ────────────────────────────────────────────────────────
  const handleAddTherapist = async (
    newTherapistData: Omit<Therapist, 'id' | 'patientsCount' | 'rating'>
  ) => {
    try {
      await createTherapistRecord(newTherapistData);
      showToast(`${newTherapistData.name} added successfully!`);
    } catch (err: any) {
      showToast(`Failed to add therapist: ${err.message}`, 'error');
      throw err;
    }
  };

  // ── Toggle Status (ACTIVE / INACTIVE) ───────────────────────────────────────
  const handleToggleStatus = async (id: string) => {
    const t = therapists.find((th) => th.id === id);
    if (!t) return;
    setActionLoading(id);
    try {
      await toggleTherapistStatus(id, t.status);
      showToast(`${t.name} set to ${t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
      setActiveMenuId(null);
    }
  };

  // ── Delete Therapist ─────────────────────────────────────────────────────────
  const handleDeleteTherapist = async (id: string) => {
    const t = therapists.find((th) => th.id === id);
    if (!window.confirm(`Remove ${t?.name ?? 'this therapist'} permanently?`)) return;
    setActionLoading(id);
    try {
      await deleteTherapistRecord(id);
      showToast(`${t?.name ?? 'Therapist'} removed.`);
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
      setActiveMenuId(null);
    }
  };

  // ── Export List CSV ──────────────────────────────────────────────────────────
  const handleExportList = () => {
    const headers = ['Name', 'Degree', 'Experience', 'Specializations', 'Patients', 'Availability', 'Rating', 'Status', 'Email'];
    const rows = therapists.map((t) => [
      `"${t.name}"`,
      `"${t.degree}"`,
      `"${t.experience}"`,
      `"${t.specializations.join(', ')}"`,
      t.patientsCount,
      `"${t.availability}"`,
      t.rating,
      `"${t.status}"`,
      `"${t.email}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `therapists_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Filter & Search ──────────────────────────────────────────────────────────
  const filteredTherapists = useMemo(() => {
    return therapists
      .filter((t) => {
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          if (
            !t.name.toLowerCase().includes(q) &&
            !t.degree.toLowerCase().includes(q) &&
            !t.specializations.some((s) => s.toLowerCase().includes(q))
          )
            return false;
        }
        if (filters.specialization !== 'all') {
          if (!t.specializations.some((s) => s.toLowerCase() === filters.specialization.toLowerCase()))
            return false;
        }
        if (filters.status !== 'all') {
          if (t.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'patients_desc') return b.patientsCount - a.patientsCount;
        if (filters.sortBy === 'rating_desc') return b.rating - a.rating;
        return 0;
      });
  }, [therapists, filters]);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage) || 1;
  const paginatedTherapists = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTherapists.slice(start, start + itemsPerPage);
  }, [filteredTherapists, currentPage]);

  // ── Availability dot helper ──────────────────────────────────────────────────
  const getAvailabilityDot = (status: AvailabilityStatus) => {
    switch (status) {
      case 'Available Today':
        return { dotColor: 'bg-blue-600', textColor: 'text-slate-700 font-semibold' };
      case 'Busy':
        return { dotColor: 'bg-slate-400', textColor: 'text-slate-500 font-semibold' };
      case 'On Leave':
        return { dotColor: 'bg-rose-500', textColor: 'text-slate-500 font-semibold' };
      default:
        return { dotColor: 'bg-slate-400', textColor: 'text-slate-600' };
    }
  };

  const handleSelectTherapist = (therapist: Therapist) => {
    if (onSelectTherapist) {
      onSelectTherapist(therapist);
    } else {
      setProfileTherapist(therapist);
    }
  };

  // ── Render guards ────────────────────────────────────────────────────────────
  if (profileTherapist) {
    return (
      <TherapistProfilePage
        therapist={profileTherapist}
        onBack={() => setProfileTherapist(null)}
        onTherapistUpdated={(updated) => setProfileTherapist(updated)}
      />
    );
  }

  if (isAddPageOpen) {
    return (
      <AddTherapistPage
        onBack={() => setIsAddPageOpen(false)}
        onTherapistCreated={(data) => {
          handleAddTherapist(data);
          setIsAddPageOpen(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          ) : (
            <span className="w-4 h-4 text-emerald-400">✓</span>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Therapists
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage therapists, schedules and patient assignments.{' '}
            {!loading && (
              <span className="text-slate-400">
                ({filteredTherapists.length} of {therapists.length})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <button
            onClick={handleExportList}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl font-semibold text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export List</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToAddTherapist) {
                onNavigateToAddTherapist();
              } else {
                setIsAddPageOpen(true);
              }
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#0F4C81] hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Therapist</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters((f) => ({ ...f, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search therapists by name, degree or specialization"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((f) => ({ ...f, searchQuery: '' }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={filters.specialization}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, specialization: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Specialization</option>
                <option value="Sports Rehab">Sports Rehab</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurological">Neurological</option>
                <option value="MSK">MSK</option>
                <option value="Pelvic Health">Pelvic Health</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Geriatrics">Geriatrics</option>
                <option value="Manual Therapy">Manual Therapy</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, status: e.target.value }));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setFilters((f) => ({ ...f, viewMode: 'table' }))}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filters.viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, viewMode: 'cards' }))}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filters.viewMode === 'cards'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(loading || seeding) && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              {seeding ? 'Seeding demo therapists…' : 'Connecting to Firestore…'}
            </p>
            <p className="text-xs text-slate-400">Real-time sync is being established</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 rounded-3xl border border-rose-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 3. Main Content */}
      {!loading && !error && (
        <>
          {filters.viewMode === 'table' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Therapist</th>
                      <th className="py-4 px-4">Specialization</th>
                      <th className="py-4 px-4">Patients</th>
                      <th className="py-4 px-4">Availability</th>
                      <th className="py-4 px-4">Rating</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {paginatedTherapists.length > 0 ? (
                      paginatedTherapists.map((therapist) => {
                        const avail = getAvailabilityDot(therapist.availability);
                        const isActioning = actionLoading === therapist.id;
                        return (
                          <tr
                            key={therapist.id}
                            onClick={() => handleSelectTherapist(therapist)}
                            className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3.5">
                                <InitialsAvatar name={therapist.name} className="w-11 h-11 text-xs font-bold shrink-0" />
                                <div>
                                  <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {therapist.name}
                                  </div>
                                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                                    {therapist.degree} • {therapist.experience}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {therapist.specializations.map((spec) => (
                                  <span
                                    key={spec}
                                    className="inline-block px-3 py-1 bg-blue-50/90 text-blue-600 rounded-full text-xs font-semibold"
                                  >
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="font-semibold text-slate-700">
                                {therapist.patientsCount}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${avail.dotColor}`} />
                                <span className={`text-xs ${avail.textColor}`}>
                                  {therapist.availability}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-1 text-xs font-bold text-slate-800">
                                <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                                <span>{therapist.rating.toFixed(1)}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              {therapist.status === 'ACTIVE' ? (
                                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold tracking-wider uppercase">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-bold tracking-wider uppercase">
                                  INACTIVE
                                </span>
                              )}
                            </td>

                            <td
                              className="py-4 px-6 text-right relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isActioning ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(
                                      activeMenuId === therapist.id ? null : therapist.id
                                    );
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              )}

                              {activeMenuId === therapist.id && (
                                <div className="absolute right-6 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-left text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    onClick={() => {
                                      handleSelectTherapist(therapist);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    <span>View Profile</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleStatus(therapist.id)}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                                  >
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    <span>
                                      Set {therapist.status === 'ACTIVE' ? 'Inactive' : 'Active'}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setProfileTherapist(therapist);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    <span>Edit Details</span>
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    onClick={() => handleDeleteTherapist(therapist.id)}
                                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                    <span>Remove Therapist</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          <Database className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                          <p className="font-bold text-slate-600 text-sm">No therapists found</p>
                          <p className="text-xs mt-1">
                            {therapists.length === 0
                              ? 'Add your first therapist to get started.'
                              : 'Try adjusting your search or filter criteria.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                  <p className="text-xs font-semibold text-slate-500">
                    Showing{' '}
                    <span className="text-slate-900 font-bold">
                      {(currentPage - 1) * itemsPerPage + 1}–
                      {Math.min(currentPage * itemsPerPage, filteredTherapists.length)}
                    </span>{' '}
                    of{' '}
                    <span className="text-slate-900 font-bold">{filteredTherapists.length}</span>{' '}
                    therapists
                  </p>

                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs font-bold">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                              currentPage === p
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Cards View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedTherapists.map((therapist) => {
                  const avail = getAvailabilityDot(therapist.availability);
                  return (
                    <div
                      key={therapist.id}
                      onClick={() => handleSelectTherapist(therapist)}
                      className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer space-y-4 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <InitialsAvatar name={therapist.name} className="w-12 h-12 text-sm font-bold shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {therapist.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              {therapist.degree} • {therapist.experience}
                            </p>
                          </div>
                        </div>

                        {therapist.status === 'ACTIVE' ? (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-extrabold uppercase">
                            INACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {therapist.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="px-2.5 py-1 bg-blue-50/90 text-blue-600 rounded-full text-xs font-semibold"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Patients</div>
                          <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                            {therapist.patientsCount}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Rating</div>
                          <div className="font-extrabold text-amber-600 text-sm mt-0.5 flex items-center justify-center space-x-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{therapist.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl flex flex-col justify-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Avail.</div>
                          <div className="flex items-center justify-center space-x-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${avail.dotColor}`} />
                            <span className="text-[10px] font-bold text-slate-700 truncate">
                              {therapist.availability.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {paginatedTherapists.length === 0 && (
                  <div className="col-span-3 py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                    <Database className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-600 text-sm">No therapists found</p>
                    <p className="text-xs mt-1">Adjust your search or add a new therapist.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddTherapistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTherapist={handleAddTherapist}
      />

      <TherapistDetailModal
        therapist={selectedTherapist}
        onClose={() => setSelectedTherapist(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
