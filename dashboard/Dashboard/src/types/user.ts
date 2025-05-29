export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
}

export interface ProxyRequest {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface Video {
  id: string;
  clientId?: string;
  date?: string;
  hour?: string;
  minutes?: string;
  second?: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  recordedAt?: string;
}
