import { redirect } from 'next/navigation';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const ctx = await getSalonContext();
  if (!ctx) redirect('/sign-in');

  return (
    <SettingsClient
      initialSalon={{
        name: ctx.salon.name ?? '',
        address: ctx.salon.address ?? '',
        phone: ctx.salon.phone ?? '',
      }}
      initialDesigner={{
        name: ctx.designer?.name ?? '',
        email: ctx.designer?.email ?? '',
      }}
    />
  );
}
