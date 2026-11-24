export type Environment = 'Demo' | 'Production';
export type TestStatus = 'PASS' | 'FAIL';

export type Role = 'QC_WEB' | 'QC_MOBILE' | 'QC_API' | 'PRODUCT_MANAGER';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

/** Satu baris hasil testing yang sudah diserialisasi untuk komponen client. */
export interface TestResultRow {
  id: string;
  sid: string;
  title: string;
  tester: string;
  /** Format YYYY-MM-DD (waktu lokal server). */
  date: string;
  environment: Environment;
  status: TestStatus;
  notes?: string;
  attemptNumber: number;
}
