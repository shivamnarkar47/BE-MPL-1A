export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  avatar?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_donations: number;
  total_revenue: number;
  pending_orders: number;
  processing_donations: number;
  new_users_today: number;
  revenue_today: number;
}

export interface DashboardMetrics extends AdminStats {
  // Can extend with additional frontend-specific metrics
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'active' | 'banned' | 'pending';
  total_orders: number;
  total_donations: number;
  eco_coins: number;
  co2_saved: number;
  joined_at: string;
  last_active: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  sale_price?: string;
  quantity: number;
  companyname: string;
  category: string;
  imageurl: string;
  images: string[];
  rating: number;
  reviews_count: number;
  sales_count: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_address: Address;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface Address {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Donation {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: DonationItem[];
  coins_earned: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  partner_id?: string;
  partner_name?: string;
  pickup_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationItem {
  cloth_type: string;
  quantity: number;
  estimated_coins: number;
}

export interface Partner {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  accepted_types: string[];
  impact_level: 'high' | 'medium' | 'premium';
  distance: string;
  active_donations: number;
  status: 'active' | 'inactive';
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  video_url?: string;
  category: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  position: 'hero' | 'promo' | 'category';
  status: 'active' | 'inactive';
  start_date?: string;
  end_date?: string;
  order: number;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardMetrics {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  users: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  donations: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface ChartData {
  labels: string[];
  values: number[];
}
