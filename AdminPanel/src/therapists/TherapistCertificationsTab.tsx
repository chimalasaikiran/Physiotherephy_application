import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Plus,
  X,
  Download,
  Share2,
  Clock,
  FileText,
  AlertCircle,
  UploadCloud,
  Globe,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';
import type { Therapist } from './types';

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'PERMANENT' | 'VALID' | 'ACTION_REQUIRED' | 'EXPIRED';
  statusLabel: string;
  isVerified: boolean;
  credentialId: string;
  iconType: 'graduation' | 'dryneedling' | 'sports';
  iconBg: string;
  iconColor: string;
  documentUrl?: string;
}

export interface MembershipItem {
  id: string;
  organization: string;
  membershipType: string;
  membershipId: string;
  bodyType: 'National Body' | 'International Body';
  memberSince: string;
  logoBg: string;
  logoType: 'iap' | 'wcpt';
}

interface TherapistCertificationsTabProps {
  therapist?: Therapist | null;
}

export const TherapistCertificationsTab: React.FC<TherapistCertificationsTabProps> = ({ therapist }) => {
  const therapistName = therapist?.name || 'Dr. Ananya Iyer';

  // Certifications list state
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      id: 'cert-1',
      title: 'Master of Physiotherapy (MPT)',
      issuer: 'Manipal Academy of Higher Education, Karnataka',
      issuedDate: 'May 2018',
      status: 'PERMANENT',
      statusLabel: 'PERMANENT',
      isVerified: true,
      credentialId: 'MAHE-MPT-2018-9842',
      iconType: 'graduation',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'cert-2',
      title: 'Certified Dry Needling Practitioner',
      issuer: 'Indian Association of Physiotherapists (IAP)',
      issuedDate: 'Oct 2021',
      expiryDate: 'Oct 2026',
      status: 'VALID',
      statusLabel: 'Oct 2026',
      isVerified: true,
      credentialId: 'IAP-CDNP-2021-4190',
      iconType: 'dryneedling',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'cert-3',
      title: 'Sports Rehabilitation Specialist',
      issuer: 'Global Physio Council',
      issuedDate: 'Jan 2023',
      expiryDate: 'Jan 2024',
      status: 'ACTION_REQUIRED',
      statusLabel: 'Action Required',
      isVerified: true,
      credentialId: 'GPC-SRS-2023-7721',
      iconType: 'sports',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ]);

  // Professional Memberships state
  const memberships: MembershipItem[] = [
    {
      id: 'mem-1',
      organization: 'Indian Association of Physiotherapists (IAP)',
      membershipType: 'Life Member',
      membershipId: 'L-12492',
      bodyType: 'National Body',
      memberSince: '2018',
      logoBg: 'bg-white',
      logoType: 'iap',
    },
    {
      id: 'mem-2',
      organization: 'World Physiotherapy (WCPT)',
      membershipType: 'Registered Affiliate Professional',
      membershipId: 'WCPT-IND-8849',
      bodyType: 'International Body',
      memberSince: '2019',
      logoBg: 'bg-[#0F5A71]',
      logoType: 'wcpt',
    },
  ];

  // Modals state
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  // Add form fields
  const [newTitle, setNewTitle] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newIssuedDate, setNewIssuedDate] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit new certification
  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIssuer.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newCert: CertificationItem = {
        id: `cert-${Date.now()}`,
        title: newTitle,
        issuer: newIssuer,
        issuedDate: newIssuedDate || 'Today',
        expiryDate: newExpiryDate || undefined,
        status: newExpiryDate ? 'VALID' : 'PERMANENT',
        statusLabel: newExpiryDate || 'PERMANENT',
        isVerified: true,
        credentialId: `VER-${Math.floor(1000 + Math.random() * 9000)}`,
        iconType: 'graduation',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      };

      setCertifications([newCert, ...certifications]);
      setIsSubmitting(false);
      setIsAddModalOpen(false);

      // Reset form
      setNewTitle('');
      setNewIssuer('');
      setNewIssuedDate('');
      setNewExpiryDate('');

      showToast(`Added "${newCert.title}" to ${therapistName}'s profile.`);
    }, 800);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Hero Callout Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Verified Certifications
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Legally verified professional certifications and academic honors.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {/* 2. Grid of 3 Verified Certification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
          >
            {/* Top Row: Icon + Verified Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl ${cert.iconBg} ${cert.iconColor} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}
              >
                {cert.iconType === 'graduation' ? (
                  <GraduationCap className="w-6 h-6" />
                ) : cert.iconType === 'dryneedling' ? (
                  <Award className="w-6 h-6" />
                ) : (
                  <Activity className="w-6 h-6" />
                )}
              </div>

              {cert.isVerified && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>VERIFIED</span>
                </span>
              )}
            </div>

            {/* Middle: Title & Subtitle Issuer */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                {cert.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                {cert.issuer}
              </p>
            </div>

            {/* Key-Value Metadata Grid (Issued & Expiry/Status) */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Issued</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{cert.issuedDate}</span>
              </div>

              <div>
                {cert.status === 'PERMANENT' ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-400 block">Status</span>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md text-[10px] mt-0.5 border border-emerald-100">
                      PERMANENT
                    </span>
                  </>
                ) : cert.status === 'ACTION_REQUIRED' ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-400 block">Renewal</span>
                    <span className="text-rose-600 font-extrabold text-xs mt-0.5 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                      <span>Action Required</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-semibold text-slate-400 block">Expiry</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{cert.expiryDate}</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom View Certificate Action Button */}
            <button
              onClick={() => setSelectedCert(cert)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-blue-600 text-xs font-extrabold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span>View Certificate</span>
            </button>
          </div>
        ))}
      </div>

      {/* 3. Section Header & Grid: Professional Memberships */}
      <div className="space-y-5 pt-2">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Professional Memberships
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((mem) => (
            <div
              key={mem.id}
              className="bg-[#F4F7FB]/70 hover:bg-[#EEF3F9] rounded-3xl p-6 border border-slate-100/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 transition-all"
            >
              {/* Logo / Badge Container */}
              <div className="flex-shrink-0">
                {mem.logoType === 'iap' ? (
                  <div className="w-14 h-14 rounded-full bg-white text-blue-700 border border-slate-200 flex items-center justify-center shadow-2xs">
                    <ShieldCheck className="w-7 h-7 text-blue-700" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#0F5A71] text-white flex items-center justify-center shadow-2xs">
                    <Globe className="w-7 h-7 text-cyan-300" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  {mem.organization}
                </h4>

                <p className="text-xs font-semibold text-slate-600">
                  {mem.membershipType} • <span className="text-slate-800">{mem.membershipId}</span>
                </p>

                {/* Badges line */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {mem.bodyType === 'National Body' ? (
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      National Body
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-teal-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      International Body
                    </span>
                  )}

                  <span className="text-xs font-medium text-slate-500">
                    Member since {mem.memberSince}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Footer Audit & Compliance Links Bar */}
      <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Documents Audit: 12 Jan 2024</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Last Updated: Today, 09:45 AM</span>
          </div>
        </div>

        <button
          onClick={() => setIsComplianceModalOpen(true)}
          className="inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-extrabold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>View Compliance Handbook</span>
        </button>
      </div>

      {/* ================= MODAL 1: VIEW CERTIFICATE PREVIEW MODAL ================= */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 relative overflow-hidden">
            {/* Top Modal Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-blue-600">
                <ShieldCheck className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Certificate Verification</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    ID: {selectedCert.credentialId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Visual Preview Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 space-y-5 relative overflow-hidden border border-slate-800 shadow-inner">
              <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
                <GraduationCap className="w-64 h-64" />
              </div>

              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                  OFFICIAL CREDENTIAL
                </span>

                <span className="text-xs text-slate-400 font-medium">Issued: {selectedCert.issuedDate}</span>
              </div>

              <div className="space-y-1 pt-2">
                <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {selectedCert.title}
                </h4>
                <p className="text-xs text-slate-300 font-semibold">{selectedCert.issuer}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Practitioner Name
                  </span>
                  <span className="text-sm font-extrabold text-white">{therapistName}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Verification Status
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center space-x-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED CLINICIAN</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    showToast(`Downloading official PDF for ${selectedCert.title}...`);
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => showToast('Print dialog initiated.')}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://physioclinic.com/verify/${selectedCert.credentialId}`);
                  showToast('Verification URL copied to clipboard.');
                }}
                className="flex items-center space-x-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Verification Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD NEW CERTIFICATION MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-blue-600">
                <Award className="w-6 h-6" />
                <h3 className="text-lg font-extrabold text-slate-900">Add New Certification</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCert} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Certified Manual Therapist (COMT)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  Issuing Organization / Institution *
                </label>
                <input
                  type="text"
                  required
                  value={newIssuer}
                  onChange={(e) => setNewIssuer(e.target.value)}
                  placeholder="e.g. Federation of Indian Manual Therapists"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Issued Date</label>
                  <input
                    type="text"
                    value={newIssuedDate}
                    onChange={(e) => setNewIssuedDate(e.target.value)}
                    placeholder="e.g. Jun 2022"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    placeholder="e.g. Jun 2027 (Optional)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Upload Dropzone Placeholder */}
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">
                  Certificate Document (PDF/JPG)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-4 text-center cursor-pointer transition-colors space-y-1">
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-600">Click to upload document</p>
                  <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: COMPLIANCE HANDBOOK MODAL ================= */}
      {isComplianceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5 text-blue-600">
                <FileText className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Clinician Compliance Handbook</h3>
                  <p className="text-xs text-slate-500 font-medium">Standard Credentialing & License Requirements 2024</p>
                </div>
              </div>
              <button
                onClick={() => setIsComplianceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600 max-h-96 overflow-y-auto pr-2 leading-relaxed">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Annual License Verification</h4>
                <p>
                  All active physiotherapists registered with the clinic must maintain valid, unexpired degrees and professional council registrations (e.g., IAP or State Council).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">2. Continuing Medical Education (CME)</h4>
                <p>
                  A minimum of 20 CME credits per year is mandatory for clinical practice renewal. Certifications in Dry Needling, Sports Rehab, or COMT must be renewed every 3-5 years.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">3. Audit & Verification Trail</h4>
                <p>
                  All credentials listed in therapist profiles undergo semi-annual audit checks by the Medical Verification Committee.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Version 4.2 • Effective Jan 2024</span>
              <button
                onClick={() => setIsComplianceModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Close Handbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCertificationsTab;
