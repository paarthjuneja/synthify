import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Home, Upload, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

// Define the shape of a DataRequest object
interface DataRequest {
  _id: string;
  requestedBy: { name: string }; // Assuming the backend populates this
  filters: object;
  status: 'open' | 'fulfilled';
  createdAt: string;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.get('/requests');
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch data requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const userInitials = user?.name.split(' ').map(n => n[0]).join('') || 'A';

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* --- Sidebar --- */}
      <div className="hidden border-r bg-slate-100/40 lg:block dark:bg-slate-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6"><Link to="/" className="flex items-center gap-2 font-semibold"><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Synthify</span></Link></div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link to="#" className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sky-500 transition-all hover:text-sky-600 dark:bg-slate-800 dark:text-slate-50"><Home className="h-4 w-4" />Dashboard</Link>
              <Link to="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"><Settings className="h-4 w-4" />Settings</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-slate-100/40 px-6 dark:bg-slate-800/40">
          <div className="w-full flex-1"><h1 className="font-semibold text-lg md:text-2xl">Admin Dashboard</h1></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><Avatar><AvatarImage src="#" alt={user?.name} /><AvatarFallback>{userInitials}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Data Requests</CardTitle>
              <CardDescription>Review and fulfill data requests from researchers.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading requests...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Filters</TableHead>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-mono text-xs">{request._id}</TableCell>
                        <TableCell className="font-mono text-xs">{JSON.stringify(request.filters)}</TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Fulfill Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}