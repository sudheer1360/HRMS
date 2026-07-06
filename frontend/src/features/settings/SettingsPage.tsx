import React from 'react';
import { Settings, User, Bell, Shield, Globe, Palette, Database } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';

const SECTIONS = [
  {
    icon: User,
    title: 'Profile Settings',
    description: 'Update your personal information and account details.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure email, SMS, and in-app notification preferences.',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Manage password, two-factor authentication, and active sessions.',
  },
  {
    icon: Globe,
    title: 'Localisation',
    description: 'Set timezone, date format, currency, and language preferences.',
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customise theme, sidebar behaviour, and display density.',
  },
  {
    icon: Database,
    title: 'Data & Privacy',
    description: 'Manage data exports, retention policies, and privacy settings.',
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and platform preferences." />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SECTIONS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        Individual setting panels are coming soon.
      </p>
    </div>
  );
}
