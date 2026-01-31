import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Droplets,
  Leaf,
  Download,
  Calendar,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  const revenueData = [
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 145 },
    { month: "Mar", revenue: 48000, orders: 132 },
    { month: "Apr", revenue: 61000, orders: 168 },
    { month: "May", revenue: 55000, orders: 152 },
    { month: "Jun", revenue: 67000, orders: 185 },
  ];

  const userGrowthData = [
    { month: "Jan", newUsers: 45, activeUsers: 320 },
    { month: "Feb", newUsers: 52, activeUsers: 380 },
    { month: "Mar", newUsers: 48, activeUsers: 410 },
    { month: "Apr", newUsers: 61, activeUsers: 465 },
    { month: "May", newUsers: 55, activeUsers: 520 },
    { month: "Jun", newUsers: 72, activeUsers: 590 },
  ];

  const ecoImpactData = [
    { month: "Jan", co2: 120, water: 5000, waste: 80 },
    { month: "Feb", co2: 145, water: 6200, waste: 95 },
    { month: "Mar", co2: 138, water: 5800, waste: 88 },
    { month: "Apr", co2: 165, water: 7100, waste: 110 },
    { month: "May", co2: 152, water: 6500, waste: 98 },
    { month: "Jun", co2: 180, water: 7800, waste: 125 },
  ];

  const categoryData = [
    { name: "Shirts", value: 35, color: "bg-emerald-500" },
    { name: "Pants", value: 25, color: "bg-blue-500" },
    { name: "Dresses", value: 20, color: "bg-purple-500" },
    { name: "Jackets", value: 12, color: "bg-amber-500" },
    { name: "Accessories", value: 8, color: "bg-pink-500" },
  ];

  const topProducts = [
    { name: "Organic Cotton Shirt", sales: 156, revenue: 46800 },
    { name: "Recycled Denim Jeans", sales: 124, revenue: 49600 },
    { name: "Bamboo Lounge Dress", sales: 98, revenue: 34300 },
    { name: "Hemp Jacket", sales: 67, revenue: 33500 },
    { name: "Upcycled Tote Bag", sales: 234, revenue: 11700 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform performance and eco-impact metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Revenue",
            value: "₹3,28,000",
            change: "+12.5%",
            icon: BarChart3,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
          },
          {
            title: "Total Orders",
            value: "902",
            change: "+8.2%",
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Active Users",
            value: "590",
            change: "+23.1%",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "CO₂ Saved",
            value: "900 kg",
            change: "+15.8%",
            icon: Leaf,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
          },
        ].map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-600 font-medium">{metric.change}</span>
                <span className="text-xs text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="eco">Eco Impact</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {revenueData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                        style={{ height: `${(data.revenue / 70000) * 250}px` }}
                      />
                      <div
                        className="w-full bg-blue-400 rounded-b-md"
                        style={{ height: `${(data.orders / 200) * 250}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Revenue (₹)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-400" />
                  <span className="text-sm text-muted-foreground">Orders</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New registrations and active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {userGrowthData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${(data.newUsers / 80) * 250}px` }}
                      />
                      <div
                        className="w-full bg-purple-200 rounded-b"
                        style={{ height: `${(data.activeUsers / 600) * 250}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span className="text-sm text-muted-foreground">New Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-200" />
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eco Impact Tab */}
        <TabsContent value="eco">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
              <CardDescription>CO₂, water, and waste saved through donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  { label: "CO₂ Saved", value: "900 kg", icon: Leaf },
                  { label: "Water Saved", value: "38,400 L", icon: Droplets },
                  { label: "Waste Diverted", value: "596 kg", icon: Package },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-[200px] flex items-end justify-between gap-2">
                {ecoImpactData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end">
                      <div
                        className="flex-1 bg-emerald-400 rounded-t"
                        style={{ height: `${(data.co2 / 200) * 150}px` }}
                      />
                      <div
                        className="flex-1 bg-blue-400 rounded-t"
                        style={{ height: `${(data.water / 8000) * 150}px` }}
                      />
                      <div
                        className="flex-1 bg-amber-400 rounded-t"
                        style={{ height: `${(data.waste / 130) * 150}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">{cat.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all`}
                          style={{ width: `${cat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products by sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{product.sales} sales</p>
                        <p className="text-xs text-muted-foreground">₹{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Eco Impact Summary */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Total Environmental Impact</h3>
              <p className="text-emerald-100">Together, our community has made a significant impact</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">2.4k</p>
                <p className="text-emerald-100 text-sm">Trees Saved</p>
              </div>
              <div>
                <p className="text-3xl font-bold">12.5k</p>
                <p className="text-emerald-100 text-sm">kg CO₂ Saved</p>
              </div>
              <div>
                <p className="text-3xl font-bold">850k</p>
                <p className="text-emerald-100 text-sm">Liters Water Saved</p>
              </div>
              <div>
                <p className="text-3xl font-bold">8.2k</p>
                <p className="text-emerald-100 text-sm">kg Waste Diverted</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
