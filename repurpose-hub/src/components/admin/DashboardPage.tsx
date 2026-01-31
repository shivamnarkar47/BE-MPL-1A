import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Package,
  ShoppingCart,
  Heart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Analytics, Donation, Order } from "@/types/admin";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingDonations, setPendingDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsData, ordersData, donationsData] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getOrders({ limit: 5 }),
        adminApi.getDonations({ status: "pending", limit: 5 }),
      ]);
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.orders);
      setPendingDonations(donationsData.donations);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${(analytics?.total_revenue || 0).toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Orders",
      value: analytics?.total_orders || 0,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: analytics?.total_users || 0,
      change: "+23.1%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Donations",
      value: analytics?.pending_donations || 0,
      change: "-5.4%",
      trend: "down",
      icon: Heart,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const ecoStats = [
    {
      label: "CO₂ Saved",
      value: `${(analytics?.co2_saved || 0).toFixed(1)} kg`,
      icon: TrendingUp,
    },
    {
      label: "Water Saved",
      value: `${(analytics?.water_saved || 0).toFixed(0)} L`,
      icon: CheckCircle2,
    },
    {
      label: "Waste Diverted",
      value: `${(analytics?.waste_diverted || 0).toFixed(1)} kg`,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/home/admin/products">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200">
            <Package className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">Manage Products</span>
          </Button>
        </Link>
        <Link to="/home/admin/users">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">View Users</span>
          </Button>
        </Link>
        <Link to="/home/admin/orders">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-200">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Process Orders</span>
          </Button>
        </Link>
        <Link to="/home/admin/donations">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-amber-50 hover:border-amber-200">
            <Heart className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium">Review Donations</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Eco Impact & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eco Impact Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Eco Impact
            </CardTitle>
            <CardDescription>Community environmental contribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ecoStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <stat.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="font-bold text-emerald-700">{stat.value}</span>
              </div>
            ))}
            <Link to="/home/admin/analytics">
              <Button variant="ghost" className="w-full mt-4 text-emerald-600 hover:text-emerald-700">
                View Detailed Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Recent Orders
              </CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link to="/home/admin/orders">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                          {order.user_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{order.user_name || "Guest User"}</p>
                        <p className="text-xs text-muted-foreground">{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">₹{order.total.toLocaleString()}</span>
                      <Badge
                        variant="secondary"
                        className={`${
                          order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          order.status === "processing" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Donations Alert */}
      {pendingDonations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Pending Donations
            </CardTitle>
            <CardDescription className="text-amber-700">
              {pendingDonations.length} donation{pendingDonations.length > 1 ? "s" : ""} awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDonations.slice(0, 3).map((donation) => (
                <div
                  key={donation.id}
                  className="p-4 rounded-lg bg-white border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{donation.user_name}</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {donation.coins_earned} coins
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {donation.items.length} item{donation.items.length > 1 ? "s" : ""} •{" "}
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <Link to="/home/admin/donations">
              <Button variant="outline" className="w-full mt-4 border-amber-300 text-amber-700 hover:bg-amber-100">
                Review All Donations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
          <CardDescription>Platform performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="text-emerald-600 font-medium">Healthy</span>
            </div>
            <Progress value={95} className="h-2" />
            <p className="text-xs text-muted-foreground">98% uptime this month</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Response</span>
              <span className="text-emerald-600 font-medium">142ms avg</span>
            </div>
            <Progress value={88} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: &lt;200ms</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="text-amber-600 font-medium">67% used</span>
            </div>
            <Progress value={67} className="h-2" />
            <p className="text-xs text-muted-foreground">12.4 GB of 18.5 GB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
