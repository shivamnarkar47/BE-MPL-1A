import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Image,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface Tutorial {
  id: string;
  title: string;
  category: string;
  status: string;
  views: number;
  created_at: string;
}

interface Banner {
  id: string;
  title: string;
  position: string;
  status: string;
  order: number;
}

export default function ContentPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API calls
    setTutorials([
      { id: "1", title: "How to Style Denim", category: "Fashion Tips", status: "published", views: 1250, created_at: "2024-01-15" },
      { id: "2", title: "Sustainable Fashion Guide", category: "Education", status: "published", views: 890, created_at: "2024-01-20" },
      { id: "3", title: "Upcycling Old Clothes", category: "DIY", status: "draft", views: 0, created_at: "2024-02-01" },
    ]);
    setBanners([
      { id: "1", title: "Summer Sale", position: "hero", status: "active", order: 1 },
      { id: "2", title: "New Arrivals", position: "promo", status: "active", order: 2 },
      { id: "3", title: "Donation Week", position: "hero", status: "inactive", order: 3 },
    ]);
    setLoading(false);
  }, []);

  const handleToggleStatus = (type: "tutorial" | "banner", id: string) => {
    if (type === "tutorial") {
      setTutorials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: t.status === "published" ? "draft" : "published" } : t))
      );
    } else {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b))
      );
    }
    toast.success("Status updated");
  };

  const handleDelete = (type: "tutorial" | "banner", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    if (type === "tutorial") {
      setTutorials((prev) => prev.filter((t) => t.id !== id));
    } else {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
    toast.success(`${type} deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage tutorials and promotional banners</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Add Tutorial
          </Button>
          <Button variant="outline">
            <Image className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tutorials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Tutorials & Guides</CardTitle>
              <CardDescription>Manage educational content for users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Views</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutorials.map((tutorial) => (
                      <TableRow key={tutorial.id}>
                        <TableCell>
                          <span className="font-medium">{tutorial.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tutorial.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={tutorial.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                            {tutorial.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {tutorial.views.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {new Date(tutorial.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus("tutorial", tutorial.id)}>
                                {tutorial.status === "published" ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete("tutorial", tutorial.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Promotional Banners</CardTitle>
              <CardDescription>Manage homepage and promotional banners</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banner Title</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <span className="font-medium">{banner.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{banner.position}</Badge>
                        </TableCell>
                        <TableCell>{banner.order}</TableCell>
                        <TableCell>
                          <Badge className={banner.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}>
                            {banner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Banner
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus("banner", banner.id)}>
                                {banner.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete("banner", banner.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
