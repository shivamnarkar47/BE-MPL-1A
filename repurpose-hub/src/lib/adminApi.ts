import { requestUrl } from "@/lib/requestUrl";
import {
  Analytics,
  User,
  Product,
  Order,
  Donation,
  Partner,
  Tutorial,
  Banner,
  ActivityLog,
  DashboardMetrics,
} from "@/types/admin";

const ADMIN_ENDPOINT = "admin";

export const adminApi = {
  // Authentication
  async login(email: string, password: string): Promise<{ access_token: string; user: any }> {
    const res = await requestUrl<{ access_token: string; user: any }>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/login`,
      data: { email, password },
    });
    return res.data;
  },
  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await requestUrl<DashboardMetrics>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/stats`,
    });
    return res.data;
  },

  async getSystemMetrics(): Promise<any> {
    const res = await requestUrl<any>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/system/metrics`,
    });
    return res.data;
  },

  // Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<{ users: User[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.role) query.set("role", params.role);

    const res = await requestUrl<{ users: User[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/users?${query.toString()}`,
    });
    return res.data;
  },

  async getUser(id: string): Promise<User> {
    const res = await requestUrl<User>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/users/${id}`,
    });
    return res.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await requestUrl<User>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/users/${id}`,
      data,
    });
    return res.data;
  },

  async banUser(id: string): Promise<void> {
    await requestUrl({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/users/${id}/ban`,
    });
  },

  async unbanUser(id: string): Promise<void> {
    await requestUrl({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/users/${id}/unban`,
    });
  },

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.status) query.set("status", params.status);

    const res = await requestUrl<{ products: Product[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/products?${query.toString()}`,
    });
    return res.data;
  },

  async getProduct(id: string): Promise<Product> {
    const res = await requestUrl<Product>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/products/${id}`,
    });
    return res.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await requestUrl<Product>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/products`,
      data,
    });
    return res.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await requestUrl<Product>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/products/${id}`,
      data,
    });
    return res.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await requestUrl({
      method: "DELETE",
      endpoint: `${ADMIN_ENDPOINT}/products/${id}`,
    });
  },

  async bulkUpdateProducts(ids: string[], data: Partial<Product>): Promise<void> {
    await requestUrl({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/products/bulk`,
      data: { ids, ...data },
    });
  },

  // Orders
  async getOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ orders: Order[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);

    const res = await requestUrl<{ orders: Order[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/orders?${query.toString()}`,
    });
    return res.data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await requestUrl<Order>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/orders/${id}`,
    });
    return res.data;
  },

  async updateOrderStatus(id: string, status: string, tracking_number?: string): Promise<Order> {
    const res = await requestUrl<Order>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/orders/${id}/status`,
      data: { status, tracking_number },
    });
    return res.data;
  },

  async processRefund(id: string, reason?: string): Promise<void> {
    await requestUrl({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/orders/${id}/refund`,
      data: { reason },
    });
  },

  // Donations
  async getDonations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ donations: Donation[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);

    const res = await requestUrl<{ donations: Donation[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/donations?${query.toString()}`,
    });
    return res.data;
  },

  async getDonation(id: string): Promise<Donation> {
    const res = await requestUrl<Donation>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/donations/${id}`,
    });
    return res.data;
  },

  async updateDonationStatus(id: string, status: string, partner_id?: string): Promise<Donation> {
    const res = await requestUrl<Donation>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/donations/${id}/status`,
      data: { status, partner_id },
    });
    return res.data;
  },

  async assignDonationToPartner(donation_id: string, partner_id: string, pickup_date?: string): Promise<Donation> {
    const res = await requestUrl<Donation>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/donations/${donation_id}/assign`,
      data: { partner_id, pickup_date },
    });
    return res.data;
  },

  // Partners
  async getPartners(): Promise<Partner[]> {
    const res = await requestUrl<Partner[]>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/partners`,
    });
    return res.data;
  },

  async createPartner(data: Partial<Partner>): Promise<Partner> {
    const res = await requestUrl<Partner>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/partners`,
      data,
    });
    return res.data;
  },

  async updatePartner(id: string, data: Partial<Partner>): Promise<Partner> {
    const res = await requestUrl<Partner>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/partners/${id}`,
      data,
    });
    return res.data;
  },

  async deletePartner(id: string): Promise<void> {
    await requestUrl({
      method: "DELETE",
      endpoint: `${ADMIN_ENDPOINT}/partners/${id}`,
    });
  },

  // Content - Tutorials
  async getTutorials(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ tutorials: Tutorial[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);

    const res = await requestUrl<{ tutorials: Tutorial[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/tutorials?${query.toString()}`,
    });
    return res.data;
  },

  async createTutorial(data: Partial<Tutorial>): Promise<Tutorial> {
    const res = await requestUrl<Tutorial>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/tutorials`,
      data,
    });
    return res.data;
  },

  async updateTutorial(id: string, data: Partial<Tutorial>): Promise<Tutorial> {
    const res = await requestUrl<Tutorial>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/tutorials/${id}`,
      data,
    });
    return res.data;
  },

  async deleteTutorial(id: string): Promise<void> {
    await requestUrl({
      method: "DELETE",
      endpoint: `${ADMIN_ENDPOINT}/tutorials/${id}`,
    });
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    const res = await requestUrl<Banner[]>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/banners`,
    });
    return res.data;
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const res = await requestUrl<Banner>({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/banners`,
      data,
    });
    return res.data;
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await requestUrl<Banner>({
      method: "PUT",
      endpoint: `${ADMIN_ENDPOINT}/banners/${id}`,
      data,
    });
    return res.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await requestUrl({
      method: "DELETE",
      endpoint: `${ADMIN_ENDPOINT}/banners/${id}`,
    });
  },

  async updateBannerOrder(banners: { id: string; order: number }[]): Promise<void> {
    await requestUrl({
      method: "POST",
      endpoint: `${ADMIN_ENDPOINT}/banners/reorder`,
      data: { banners },
    });
  },

  // Activity Logs
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    admin_id?: string;
    action?: string;
    resource_type?: string;
  }): Promise<{ activities: ActivityLog[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.admin_id) query.set("admin_id", params.admin_id);
    if (params?.action) query.set("action", params.action);
    if (params?.resource_type) query.set("resource_type", params.resource_type);

    const res = await requestUrl<{ activities: ActivityLog[]; total: number }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/activities?${query.toString()}`,
    });
    return res.data;
  },

  // Reports & Analytics
  async getSalesReport(params: {
    date_from: string;
    date_to: string;
    group_by: 'day' | 'week' | 'month';
  }): Promise<{ data: { date: string; revenue: number; orders: number }[] }> {
    const res = await requestUrl<{ data: { date: string; revenue: number; orders: number }[] }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/reports/sales`,
      ...params,
    });
    return res.data;
  },

  async getUsersReport(params: {
    date_from: string;
    date_to: string;
  }): Promise<{ data: { date: string; registrations: number; active: number }[] }> {
    const res = await requestUrl<{ data: { date: string; registrations: number; active: number }[] }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/reports/users`,
      ...params,
    });
    return res.data;
  },

  async getEcoImpactReport(): Promise<{
    total_co2_saved: number;
    total_water_saved: number;
    total_waste_diverted: number;
    total_trees_saved: number;
    by_month: { month: string; co2: number; water: number; waste: number }[];
  }> {
    const res = await requestUrl<{
      total_co2_saved: number;
      total_water_saved: number;
      total_waste_diverted: number;
      total_trees_saved: number;
      by_month: { month: string; co2: number; water: number; waste: number }[];
    }>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/reports/eco-impact`,
    });
    return res.data;
  },

  async exportData(type: 'users' | 'orders' | 'products' | 'donations', params?: Record<string, string>): Promise<Blob> {
    const query = new URLSearchParams(params);
    const res = await requestUrl<Blob>({
      method: "GET",
      endpoint: `${ADMIN_ENDPOINT}/export/${type}?${query.toString()}`,
      responseType: "blob",
    });
    return res.data;
  },
};
