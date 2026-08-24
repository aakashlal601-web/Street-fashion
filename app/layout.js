import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import AdminShell from '../../../components/admin/AdminShell';

export default async function AdminPanelLayout({ children }) {
  // Defense in depth: middleware already blocks unauthenticated requests,
  // but every server component that touches admin data re-checks the session.
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <AdminShell username={session.user.name}>{children}</AdminShell>;
}
