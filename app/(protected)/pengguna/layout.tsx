import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function PenggunaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'PRODUCT_MANAGER') {
    redirect('/403');
  }

  return <>{children}</>;
}
