import { useEffect, useState } from "react";
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LayoutDashboard, Package, Users, BarChart3, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getCookie } from "@/lib/getUser";
import { Navigate } from "react-router-dom";

interface Analytics {
    total_products: number;
    total_users: number;
    total_orders: number;
    total_revenue: number;
}

interface Product {
    id: string;
    name: string;
    price: string;
    quantity: number;
    companyname: string;
}

const AdminDashboard = () => {
    const user = getCookie();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, productsRes] = await Promise.all([
                    requestUrl({ method: "GET", endpoint: "admin/analytics" }),
                    requestUrl({ method: "GET", endpoint: "allProducts" })
                ]);
                setAnalytics(analyticsRes.data);
                setProducts(productsRes.data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Check if user is admin
    if (!user || user.role !== "admin") {
        return <Navigate to="/home" replace />;
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading Admin Dashboard...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="text-green-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">Overview of platform performance and management.</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Plus size={18} />
                    Add Product
                </Button>
            </div>

            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Revenue</CardTitle>
                        <BarChart3 className="text-green-500" size={20} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{analytics?.total_revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Orders</CardTitle>
                        <Package className="text-blue-500" size={20} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.total_orders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Total Products</CardTitle>
                        <Package className="text-orange-500" size={20} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.total_products}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">Active Users</CardTitle>
                        <Users className="text-indigo-500" size={20} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.total_users}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Management */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Product Management</CardTitle>
                            <CardDescription>Manage your inventory and product listings.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search products..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.companyname}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                <Pencil size={18} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
