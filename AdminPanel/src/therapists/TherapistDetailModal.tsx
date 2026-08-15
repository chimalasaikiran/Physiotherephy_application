import React from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import {
  X,
  Star,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import type { Therapist } from './types';

interface TherapistDetailModalProps {
  therapist: Therapist | null;
  onClose: () => void;
  onToggleStatus?: (id: string) => void;
}

export const TherapistDetailModal: React.FC<TherapistDetailModalProps> = ({
  therapist,
  onClose,
  onToggleStatus,
}) => {
  if (!therapist) return null;

  const getAvailabilityBadge = () => {
    switch (therapist.availability) {
      case 'Available Today':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          dot: 'bg-blue-500',
          icon: CheckCircle2,
        };
      case 'Busy':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: AlertCircle,
        };
      case 'On Leave':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-100',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: CheckCircle2,
        };
    }
  };

  const availStyle = getAvailabilityBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <InitialsAvatar
              name={therapist.name}
              className="w-20 h-20 sm:w-24 sm:h-24 text-2xl font-bold border-2 border-white/20 shadow-lg shrink-0"
            />

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                    therapist.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                  }`}
                >
                  {therapist.status}
                </span>

                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  <Star className="w-3 h-3 fill-amber-300 stroke-amber-400" />
                  <span>{therapist.rating.toFixed(1)} Rating</span>
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight">{therapist.name}</h2>
              <p className="text-xs text-blue-100 font-medium">
                {therapist.degree} • {therapist.experience}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                {therapist.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 bg-white/15 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Info Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-slate-900">{therapist.patientsCount}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Assigned Patients</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xl font-black text-slate-900">{therapist.rating}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Patient Rating</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-slate-900">{therapist.experience.split(' ')[0]}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Years Clinical</p>
            </div>
          </div>

          {/* Contact & Availability Info */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Contact & Availability Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{therapist.email}</span>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{therapist.phone}</span>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{therapist.location || 'Building A, Clinic'}</span>
              </div>

              <div className="flex items-center space-x-2.5 text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{therapist.workingHours || '09:00 AM - 05:00 PM'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Current Work Status:</span>
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${availStyle.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${availStyle.dot}`} />
                <span>{therapist.availability}</span>
              </span>
            </div>
          </div>

          {/* Professional Bio */}
          {therapist.bio && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Clinical Overview & Specialization
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {therapist.bio}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {onToggleStatus ? (
            <button
              onClick={() => {
                onToggleStatus(therapist.id);
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                therapist.status === 'ACTIVE'
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {therapist.status === 'ACTIVE' ? 'Set as INACTIVE' : 'Set as ACTIVE'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
