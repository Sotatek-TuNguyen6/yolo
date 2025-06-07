export interface UserReportSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  growthRate: number; // percentage growth compared to last month
}

export interface UserStatusStats {
  [key: string]: number; // Use string index instead of mapped type
}

export interface MonthlyStats {
  [month: string]: number; // YYYY-MM format with number of registrations
}

export interface UserReportResponse {
  summary: UserReportSummary;
  statusStats: UserStatusStats;
  monthlyStats: MonthlyStats;
  users?: any[]; // Changed from User[] to any[] to allow undefined password
}
