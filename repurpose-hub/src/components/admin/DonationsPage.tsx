import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Coins,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Donation } from "@/types/admin";
import { toast } from "sonner";

export default function DonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, [page, statusFilter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDonations({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setDonations(response.donations);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  const handleUpdateStatus = async (donationId: string, newStatus: string) => {
    try {
      await adminApi.updateDonationStatus(donationId, newStatus);
      toast.success(`Donation status updated to ${newStatus}`);
      fetchDonations();
    } catch (error) {
      toast.error("Failed to update donation status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Approved</Badge>;
      case "processing":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Processing</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Donation Management</h1>
          <p className="text-muted-foreground">Review and manage clothing donations</p>
        </div>
        <Button onClick={() => navigate("/home/admin/partners")}>
          <MapPin className="w-4 h-4 mr-2" />
          Manage Partners
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending", value: 15, color: "bg-amber-50 border-amber-200" },
          { label: "Approved", value: 8, color: "bg-blue-50 border-blue-200" },
          { label: "Processing", value: 12, color: "bg-purple-50 border-purple-200" },
          { label: "Completed", value: 234, color: "bg-emerald-50 border-emerald-200" },
          { label: "Rejected", value: 3, color: "bg-red-50 border-red-200" },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color}>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Donations</CardTitle>
          <CardDescription>{total} total donations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donation ID</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Partner</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.length > 0 ? (
                    donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <span className="font-mono text-sm">#{donation.id.slice(-8)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                                {donation.user_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{donation.user_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">{donation.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {donation.items.slice(0, 2).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {item.quantity}x {item.cloth_type}
                              </Badge>
                            ))}
                            {donation.items.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{donation.items.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <Coins className="w-4 h-4" />
                            <span>{donation.coins_earned}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(donation.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {donation.partner_name || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {new Date(donation.created_at).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => navigate(`/home/admin/donations/${donation.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {donation.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, "approved")}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, "rejected")}>
                                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {donation.status === "approved" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, "processing")}>
                                  <Truck className="w-4 h-4 mr-2 text-purple-600" />
                                  Start Processing
                                </DropdownMenuItem>
                              )}
                              {donation.status === "processing" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(donation.id, "completed")}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No donations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {total > 10 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} donations
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * 10 >= total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
