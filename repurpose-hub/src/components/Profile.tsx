import { useEffect, useState } from "react";
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Package, User, MapPin, Settings, ExternalLink, Leaf, Sparkles } from "lucide-react";
import { getCookie } from "@/lib/getUser";
import { Link } from "react-router-dom";

interface Order {
    id: string;
    _id: string;
    total_price: number;
    status: string;
    created_at: string;
    items: any[];
}

const Profile = () => {
    const user = getCookie();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) return;
            try {
                const response = await requestUrl({
                    method: "GET",
                    endpoint: `orders/${user.id}`,
                });
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Info */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <User size={48} className="text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold">{user?.full_name}</h2>
                                <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

                                <div className="w-full space-y-3">
                                    <Link to="/home/impact" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                        <div className="flex items-center gap-2 text-green-700 font-medium">
                                            <Leaf size={18} />
                                            <span>Eco Impact</span>
                                        </div>
                                        <ExternalLink size={14} className="text-green-600" />
                                    </Link>
                                    <Link to="/home/quiz" className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <div className="flex items-center gap-2 text-indigo-700 font-medium">
                                            <Sparkles size={18} />
                                            <span>Style Quiz</span>
                                        </div>
                                        <ExternalLink size={14} className="text-indigo-600" />
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex border-b mb-8">
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === "orders" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            <Package size={18} />
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab("address")}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === "address" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            <MapPin size={18} />
                            Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === "settings" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            <Settings size={18} />
                            Settings
                        </button>
                    </div>

                    {activeTab === "orders" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                                <CardDescription>View and track your recent purchases.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">Loading orders...</div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-100 rounded-md">
                                                        <Package className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">₹{order.total_price}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>You haven't placed any orders yet.</p>
                                        <Button variant="link" asChild>
                                            <Link to="/home">Start Shopping</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "address" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                                <CardDescription>Manage your shipping and billing addresses.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-gray-500">
                                    <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No saved addresses found.</p>
                                    <Button className="mt-4 bg-green-600 hover:bg-green-700">Add New Address</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "settings" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>Update your profile information and preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" defaultValue={user?.full_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" defaultValue={user?.email} disabled />
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
