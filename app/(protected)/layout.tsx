import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AuthProvider } from '@/app/context/AuthContext';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { Navbar } from '@/app/components/Navbar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <AuthProvider user={session}>
      <ThemeProvider>
        <Navbar />
        <main className="flex-1 mt-[24px] lg:mt-[32px]">{children}</main>
      </ThemeProvider>
    </AuthProvider>
  );
}
