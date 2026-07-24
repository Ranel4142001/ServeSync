import { useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { Card } from '@/shared/ui/DashboardComponents';
import { useAuthStore } from '@/features/auth';

export function AdminSettingsPage() {
  const { user } = useAuthStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');

  // Profile Tab States
  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] ?? 'Ranel');
  const [lastName, setLastName]   = useState(user?.fullName?.split(' ')[1] ?? 'Dahil');
  const [email, setEmail]         = useState(user?.email ?? 'admin@servesync.com');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security Tab States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError]     = useState<string | null>(null);

  // Notifications Tab States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ticketAlerts, setTicketAlerts]             = useState(true);
  const [weeklyDigest, setWeeklyDigest]             = useState(false);

  // Actions
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('Passwords do not match');
      return;
    }

    setSecuritySuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  return (
    <DashboardLayout title="Settings" description="Manage your account and preferences">
      <div className="flex flex-col gap-3.5 pb-6">

        {/* ── Tab Bar Navigation (Matches Screenshot Layout) ────────────────────── */}
        <div className="flex border-b border-gray-200 mb-2.5 gap-6">
          {(['PROFILE', 'SECURITY', 'NOTIFICATIONS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-[11px] font-semibold transition-all relative outline-none ${
                activeTab === tab
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'PROFILE' ? 'Profile' : tab === 'SECURITY' ? 'Security' : 'Notifications'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        
        {/* 1. PROFILE TAB */}
        {activeTab === 'PROFILE' && (
          <Card title="Profile information">
            <form onSubmit={handleSaveProfile} className="px-4 py-4 flex flex-col gap-4">
              
              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[10px] text-green-700">
                  Profile updated successfully!
                </div>
              )}

              {/* Grid: First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="first-name" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                    placeholder="First name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="last-name" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="Email address"
                />
              </div>

              {/* Save changes action */}
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button
                  type="submit"
                  className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors shadow-sm"
                >
                  Save changes
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* 2. SECURITY TAB */}
        {activeTab === 'SECURITY' && (
          <Card title="Change password">
            <form onSubmit={handleUpdatePassword} className="px-4 py-4 flex flex-col gap-4">
              
              {securitySuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[10px] text-green-700">
                  Password updated successfully!
                </div>
              )}
              {securityError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[10px] text-red-700">
                  {securityError}
                </div>
              )}

              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="current-pass" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Current password
                </label>
                <input
                  id="current-pass"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-pass" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  New password
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="At least 8 characters"
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-pass" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Confirm password
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="Repeat new password"
                />
              </div>

              {/* Update Password action */}
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button
                  type="submit"
                  className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors shadow-sm"
                >
                  Update password
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* 3. NOTIFICATIONS TAB */}
        {activeTab === 'NOTIFICATIONS' && (
          <Card title="Notification preferences">
            <div className="flex flex-col divide-y divide-gray-100">
              
              {/* Option 1: Email notifications */}
              <div className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-900">Email notifications</span>
                  <span className="text-[10px] text-gray-400">Receive summary emails for important events</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      emailNotifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 2: New ticket alerts */}
              <div className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-900">New ticket alerts</span>
                  <span className="text-[10px] text-gray-400">Get notified when a new ticket is created</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketAlerts(!ticketAlerts)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    ticketAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      ticketAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: Weekly digest */}
              <div className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-900">Weekly digest</span>
                  <span className="text-[10px] text-gray-400">Weekly summary of ticket volume and performance</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      weeklyDigest ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
