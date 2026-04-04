import { api } from "./http";

type AdminDashboardSummaryApiResponse = {
  total_users: number;
  gmail_connected_users: number;
  calendar_connected_users: number;
  today_analyzed_emails: number;
  today_generated_drafts: number;
  total_support_tickets: number;
};

type AdminEmailVolumeApiResponse = {
  volume_data: Array<{
    date: string;
    count: number;
  }>;
};

type AdminDomainDistributionApiResponse = {
  domain_data: Array<{
    domain: string;
    count: number;
  }>;
};

type AdminWeeklyTrendApiResponse = {
  trend_data: Array<{
    date: string;
    received_count: number;
    draft_count: number;
  }>;
};

type AdminSupportTicketListApiResponse = {
  total_count: number;
  tickets: Array<{
    ticket_id: number;
    user_id: number;
    title: string;
    status: string;
    created_at: string;
  }>;
};

export async function getAdminDashboardSummary() {
  const response = await api.get<AdminDashboardSummaryApiResponse>("/api/admin/dashboard/summary");
  return response.data;
}

export async function getAdminEmailVolume(startDate: string, endDate: string) {
  const response = await api.get<AdminEmailVolumeApiResponse>("/api/admin/dashboard/email-volume", {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  });

  return response.data.volume_data;
}

export async function getAdminDomainDistribution(limit = 5) {
  const response = await api.get<AdminDomainDistributionApiResponse>(
    "/api/admin/dashboard/domain-distribution",
    {
      params: { limit },
    },
  );

  return response.data.domain_data;
}

export async function getAdminWeeklyTrend() {
  const response = await api.get<AdminWeeklyTrendApiResponse>("/api/admin/dashboard/weekly-trend");
  return response.data.trend_data;
}

export async function getAdminSupportTickets(size = 20) {
  const response = await api.get<AdminSupportTicketListApiResponse>("/api/admin/support-tickets", {
    params: {
      page: 1,
      size,
    },
  });

  return response.data.tickets;
}
