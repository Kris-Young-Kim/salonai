import { redirect } from 'next/navigation';
import { getSalonContext } from '@/lib/auth/getSalonContext';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const ctx = await getSalonContext();
  if (!ctx) redirect('/sign-in');

  return (
    <DashboardClient
      salonName={ctx.salon.name ?? '유니헤어샵'}
      salonPhone={ctx.salon.phone ?? ''}
    />
  );
}
