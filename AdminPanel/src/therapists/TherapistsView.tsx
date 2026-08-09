import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { Therapist, TherapistFilters, AvailabilityStatus } from './types';
import { INITIAL_THERAPISTS } from './mockTherapists';
import { AddTherapistModal } from './AddTherapistModal';
import { AddTherapistPage } from './AddTherapistPage';
import { TherapistDetailModal } from './TherapistDetailModal';
import { TherapistProfilePage } from './TherapistProfilePage';

interface TherapistsViewProps {
  onNavigateToAddTherapist?: () => void;
  onSelectTherapist?: (therapist: Therapist) => void;
}

export const TherapistsView: React.FC<TherapistsViewProps> = ({
  onNavigateToAddTherapist,
  onSelectTherapist,
}) => {
  const [therapists, setTherapists] = useState<Therapist[]>(INITIAL_THERAPISTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [profileTherapist, setProfileTherapist] = useState<Therapist | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  // Add new therapist
  const handleAddTherapist = (
    newTherapistData: Omit<Therapist, 'id' | 'patientsCount' | 'rating'>
  ) => {
    const newTherapist: Therapist = {
      ...newTherapistData,
      id: `t-${Date.now()}`,
      patientsCount: 0,
      rating: 5.0,
    };
    setTherapists((prev) => [newTherapist, ...prev]);
  };

  // Toggle Status (ACTIVE / INACTIVE)
  const handleToggleStatus = (id: string) => {
    setTherapists((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
          : t
      )
    );
    setActiveMenuId(null);
  };

  // Delete Therapist
  const handleDeleteTherapist = (id: string) => {
    setTherapists((prev) => prev.filter((t) => t.id !== id));
    setActiveMenuId(null);
  };

  // Export List CSV
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `therapists_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search Logic
  const filteredTherapists = useMemo(() => {
    return therapists
      .filter((t) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = t.name.toLowerCase().includes(q);
          const matchesDegree = t.degree.toLowerCase().includes(q);
          const matchesSpec = t.specializations.some((s) => s.toLowerCase().includes(q));
          if (!matchesName && !matchesDegree && !matchesSpec) return false;
        }

        // Specialization filter
        if (filters.specialization !== 'all') {
          const hasSpec = t.specializations.some(
            (s) => s.toLowerCase() === filters.specialization.toLowerCase()
          );
          if (!hasSpec) return false;
        }

        // Status filter
        if (filters.status !== 'all') {
          if (t.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'patients_desc') {
          return b.patientsCount - a.patientsCount;
        }
        if (filters.sortBy === 'rating_desc') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [therapists, filters]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage) || 1;
  const paginatedTherapists = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTherapists.slice(start, start + itemsPerPage);
  }, [filteredTherapists, currentPage, itemsPerPage]);

  // Availability Indicator Helper
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

  if (profileTherapist) {
    return (
      <TherapistProfilePage
        therapist={profileTherapist}
        onBack={() => setProfileTherapist(null)}
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
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Therapists
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage therapists, schedules and patient assignments.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Export List Button */}
          <button
            onClick={handleExportList}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl font-semibold text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export List</span>
          </button>

          {/* Add Therapist Button */}
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
          {/* Left: Search input */}
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
              placeholder="Search therapists by name or specialization"
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

          {/* Right: Dropdown Filters + View Mode Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Specialization Filter */}
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

            {/* Status Filter */}
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

            {/* View Mode Toggle (Table / Cards) */}
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

      {/* 3. Main Content: Table or Mobile Grid */}
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
                    return (
                      <tr
                        key={therapist.id}
                        onClick={() => handleSelectTherapist(therapist)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Therapist Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            {therapist.avatarUrl ? (
                              <img
                                src={therapist.avatarUrl}
                                alt={therapist.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 flex-shrink-0">
                                {therapist.initials || 'DR'}
                              </div>
                            )}

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

                        {/* Specialization Tags */}
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

                        {/* Patients Count */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-700">
                            {therapist.patientsCount}
                          </span>
                        </td>

                        {/* Availability */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${avail.dotColor}`} />
                            <span className={`text-xs ${avail.textColor}`}>
                              {therapist.availability}
                            </span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1 text-xs font-bold text-slate-800">
                            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                            <span>{therapist.rating.toFixed(1)}</span>
                          </div>
                        </td>

                        {/* Status */}
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

                        {/* Actions Menu */}
                        <td
                          className="py-4 px-6 text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === therapist.id ? null : therapist.id
                              )
                            }
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

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
                                  alert(`Edit profile for ${therapist.name}`);
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
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <p className="font-bold text-slate-600 text-sm">No therapists found</p>
                      <p className="text-xs mt-1">Try adjusting search or filter criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">1-10</span> of{' '}
              <span className="text-slate-900 font-bold">48</span> therapists
            </p>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 3
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                3
              </button>

              <span className="px-1 text-slate-400 text-xs font-bold">...</span>

              <button
                onClick={() => setCurrentPage(5)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 5
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                5
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Cards View (Responsive Grid) */
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
                      {therapist.avatarUrl ? (
                        <img
                          src={therapist.avatarUrl}
                          alt={therapist.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                          {therapist.initials || 'DR'}
                        </div>
                      )}

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

                  {/* Specialization Tags */}
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

                  {/* Rating & Availability & Patients */}
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
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
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
          </div>
        </div>
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
