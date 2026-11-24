import type { Role } from '@/app/types';

export const ALL_ROLES: Role[] = ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'];

/** Role yang berhak membuka halaman masing-masing (di-root dengan "/" mis. "/input"). */
export const ROLE_ACCESS: Record<string, Role[]> = {
  '/input': ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'],
  '/riwayat': ALL_ROLES,
  '/dashboard': ['QC_WEB', 'QC_MOBILE', 'QC_API', 'PRODUCT_MANAGER'],
  '/pengguna': ['PRODUCT_MANAGER'],
};

export const ROLE_LABELS: Record<Role, string> = {
  QC_WEB: 'QC Web',
  QC_MOBILE: 'QC Mobile',
  QC_API: 'QC API',
  PRODUCT_MANAGER: 'Product Manager',
};

export function isOneOf(role: string | undefined, allowed: Role[]): boolean {
  return role !== undefined && (allowed as string[]).includes(role);
}
