import { useEffect, useState } from "react";
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Leaf, Droplets, Trash2, TreeDeciduous, Award, Users } from "lucide-react";
import { getCookie } from "@/lib/getUser";

interface EcoImpact {
    co2_saved: number;
    water_saved: number;
    waste_diverted: number;
    trees_saved: number;
    badges: string[];
}

interface CommunityImpact {
    total_co2: number;
    total_water: number;
    total_waste: number;
    total_trees: number;
    total_users: number;
}

const EcoDashboard = () => {
    const user = getCookie();
    const [impact, setImpact] = useState<EcoImpact | null>(null);
    const [communityImpact, setCommunityImpact] = useState<CommunityImpact | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImpactData = async () => {
            if (!user?.id) return;

            try {
                const [userRes, communityRes] = await Promise.all([
                    requestUrl({ method: "GET", endpoint: `eco-impact/${user.id}` }),
                    requestUrl({ method: "GET", endpoint: "community-impact" })
                ]);

                setImpact(userRes.data);
                setCommunityImpact(communityRes.data);
            } catch (error) {
                console.error("Error fetching impact data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImpactData();
    }, [user?.id]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading your impact...</div>;
    }

    const metrics = [
        {
            title: "CO2 Saved",
            value: `${impact?.co2_saved.toFixed(2)} kg`,
            icon: <Leaf className="text-green-500" />,
            description: "Equivalent to driving 5 miles",
            progress: Math.min((impact?.co2_saved || 0) * 10, 100),
            color: "bg-green-500"
        },
        {
            title: "Water Saved",
            value: `${impact?.water_saved.toFixed(0)} L`,
            icon: <Droplets className="text-blue-500" />,
            description: "About 15 showers saved",
            progress: Math.min((impact?.water_saved || 0) / 10, 100),
            color: "bg-blue-500"
        },
        {
            title: "Waste Diverted",
            value: `${impact?.waste_diverted.toFixed(2)} kg`,
            icon: <Trash2 className="text-orange-500" />,
            description: "Kept out of landfills",
            progress: Math.min((impact?.waste_diverted || 0) * 20, 100),
            color: "bg-orange-500"
        },
        {
            title: "Trees Saved",
            value: `${impact?.trees_saved.toFixed(1)}`,
            icon: <TreeDeciduous className="text-emerald-600" />,
            description: "Forest contribution",
            progress: Math.min((impact?.trees_saved || 0) * 50, 100),
            color: "bg-emerald-600"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Eco-Impact Dashboard</h1>
                <p className="text-gray-600">Track your contribution to a greener planet.</p>
            </div>

            {/* Personal Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {metrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                            {metric.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-1">{metric.value}</div>
                            <p className="text-xs text-gray-500 mb-4">{metric.description}</p>
                            <Progress value={metric.progress} className={`h-2 ${metric.color}`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges & Achievements */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="text-yellow-500" />
                            Your Achievements
                        </CardTitle>
                        <CardDescription>Badges you've earned through sustainable shopping.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6">
                            {impact?.badges.length ? (
                                impact.badges.map((badge, index) => (
                                    <div key={index} className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400">
                                            <Award size={32} className="text-yellow-600" />
                                        </div>
                                        <span className="text-xs font-medium text-center">{badge}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 w-full text-gray-500">
                                    Start shopping to earn your first badge!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Community Impact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-indigo-500" />
                            Community Impact
                        </CardTitle>
                        <CardDescription>What we've achieved together.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total CO2 Saved</span>
                                    <span className="font-bold">{communityImpact?.total_co2.toFixed(0)} kg</span>
                                </div>
                                <Progress value={75} className="h-1 bg-indigo-100" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Total Water Saved</span>
                                    <span className="font-bold">{communityImpact?.total_water.toFixed(0)} L</span>
                                </div>
                                <Progress value={60} className="h-1 bg-indigo-100" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Waste Diverted</span>
                                    <span className="font-bold">{communityImpact?.total_waste.toFixed(0)} kg</span>
                                </div>
                                <Progress value={85} className="h-1 bg-indigo-100" />
                            </div>
                            <div className="pt-4 border-t text-center">
                                <div className="text-2xl font-bold text-indigo-600">{communityImpact?.total_users}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Active Eco-Warriors</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EcoDashboard;
