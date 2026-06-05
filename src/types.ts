export interface CertStatus {
  domain: string;
  days: number | null;
  expires: string | null;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'EXPIRED' | 'ERROR';
  detail: string;
}

export interface MonitoredDomain {
  domain: string;
  addedAt: Date;
}
