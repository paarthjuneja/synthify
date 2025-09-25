import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Home, PlusCircle, FileClock, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

// Define the shape of a Dataset object based on your backend model
interface Dataset {
  _id: string;
  name: string;
  status: 'Ready' | 'Processing' | 'Failed'; // Assuming status is handled on frontend for now
  filtersUsed: object;
  createdAt: string;
}

export function ResearcherDashboard() {
  const { user, logout } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch datasets from the backend
  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/datasets');
      // For now, we manually add a 'status' for UI purposes
      const datasetsWithStatus = data.map((d: any) => ({ ...d, status: 'Ready' }));
      setDatasets(datasetsWithStatus);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const filters = {
      age: formData.get('age') as string,
      conditions: formData.get('conditions') as string,
    };
    
    try {
      // Call the API to request a new dataset
      await api.post('/datasets/request', { name, filters });
      // Refresh the dataset list after a successful request
      fetchDatasets();
      // Here you would also close the dialog
    } catch (error) {
      console.error("Failed to request dataset:", error);
    }
  };

  const userInitials = user?.name.split(' ').map(n => n[0]).join('') || 'U';

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
        {/* --- Header --- */}
        <header className="flex h-16 items-center gap-4 border-b bg-slate-100/40 px-6 dark:bg-slate-800/40">
          <div className="w-full flex-1"><h1 className="font-semibold text-lg md:text-2xl">Welcome, {user?.name || 'Researcher'}</h1></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><Avatar><AvatarImage src="#" alt={user?.name} /><AvatarFallback>{userInitials}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem>Settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* --- Main Dashboard --- */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h2 className="font-semibold text-lg md:text-2xl">My Datasets</h2>
            <Dialog>
              <DialogTrigger asChild><Button className="ml-auto flex items-center gap-2"><PlusCircle className="h-4 w-4" />Request New Dataset</Button></DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleRequestSubmit}>
                  <DialogHeader><DialogTitle>Request a New Dataset</DialogTitle><DialogDescription>Define the filters for the synthetic data you need.</DialogDescription></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Dataset Name</Label><Input id="name" name="name" placeholder="e.g., Hypertension Study" className="col-span-3" required /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="age" className="text-right">Age Range</Label><Input id="age" name="age" placeholder="e.g., >45" className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="conditions" className="text-right">Conditions</Label><Input id="conditions" name="conditions" placeholder="e.g., Diabetes, Asthma" className="col-span-3" /></div>
                  </div>
                  <DialogFooter><Button type="submit">Submit Request</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* --- Dataset Cards Grid --- */}
          {isLoading ? (
            <p>Loading datasets...</p>
          ) : datasets.length === 0 ? (
            <p>You haven't created any datasets yet. Try requesting a new one!</p>
          ) : (
            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              {datasets.map((dataset) => (
                <motion.div key={dataset._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {dataset.name}
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">{dataset.status}</span>
                      </CardTitle>
                      <CardDescription>{JSON.stringify(dataset.filtersUsed)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow"><div className="text-sm text-slate-500 flex items-center"><FileClock className="w-4 h-4 mr-2" />Created on {new Date(dataset.createdAt).toLocaleDateString()}</div></CardContent>
                    <CardFooter><Button asChild className="w-full"><Link to={`/dashboard/researcher/timeline/${dataset._id}`}>View Timeline</Link></Button></CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}