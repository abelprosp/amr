import { redirect } from 'next/navigation';
import { getProfile } from '@/app/lib/auth/get-profile';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  if (profile.role !== 'admin') redirect('/');

  return <AdminClient />;
}
