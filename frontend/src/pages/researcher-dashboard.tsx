import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Home, PlusCircle, FileClock, Settings, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isValid, parseISO } from 'date-fns';

// Zod schema for the new, detailed form
const datasetRequestSchema = z.object({
  name: z.string().min(3, "Dataset name is required."),
  GENDER: z.string().optional(),
  RACE: z.string().optional(),
  has_diabetes: z.string().optional(),
  has_hypertension: z.string().optional(),
  optional_diseases: z.string().optional(),
});
type DatasetRequestFormValues = z.infer<typeof datasetRequestSchema>;

interface Dataset {
  _id: string;
  name: string;
  status: 'Ready' | 'Processing' | 'Failed';
  filtersUsed: object;
  createdAt: string;
}

export function ResearcherDashboard() {
  const { user, logout } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DatasetRequestFormValues>({
    resolver: zodResolver(datasetRequestSchema),
    defaultValues: { name: "" },
  });

  const fetchDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // CORRECTED API CALL: The path must start with /api/
      const data = await api.get('/api/datasets');
      const processedData = data.map((d: any) => ({
        ...d,
        status: 'Ready',
        createdAt: isValid(parseISO(d.createdAt)) ? format(parseISO(d.createdAt), 'PPP') : 'Invalid Date',
      }));
      setDatasets(processedData);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDatasets(); }, []);

  const onSubmit = async (values: DatasetRequestFormValues) => {
    const { name, optional_diseases, ...categoricalFilters } = values;
    const filters: Record<string, any> = {};
    for (const [key, value] of Object.entries(categoricalFilters)) {
      if (value && value !== "") {
        filters[key] = value === 'true' || value === 'false' ? (value === 'true') : value;
      }
    }
    if (optional_diseases) {
      filters.DISEASES = { "$in": optional_diseases.split(',').map(d => d.trim()) };
    }
    try {
      // CORRECTED API CALL: The path must start with /api/
      await api.post('/api/datasets/request', { name, filters });
      fetchDatasets(); // Re-fetch data to show the new dataset
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to request dataset:", error);
      const errorMessage = error instanceof Error ? error.message : "Submission failed.";
      form.setError("root", { message: errorMessage.includes("404") ? "No timelines found for these filters." : errorMessage });
    }
  };

  const userInitials = user?.name.split(' ').map(n => n[0]).join('') || 'R';

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* --- Sidebar (Restored) --- */}
      <div className="hidden border-r bg-slate-100/40 lg:block dark:bg-slate-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6"><Link to="/" className="flex items-center gap-2 font-semibold"><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">Synthify</span></Link></div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link to="/dashboard/researcher" className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sky-500 transition-all hover:text-sky-600 dark:bg-slate-800 dark:text-slate-50"><Home className="h-4 w-4" />Dashboard</Link>
              <Link to="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"><Settings className="h-4 w-4" />Settings</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex flex-col">
        {/* --- Header (Restored) --- */}
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button className="ml-auto flex items-center gap-2"><PlusCircle className="h-4 w-4" />Request New Dataset</Button></DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Request a New Dataset</DialogTitle><DialogDescription>Define filters for the synthetic data. Unused filters will be ignored.</DialogDescription></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Dataset Name</FormLabel><FormControl><Input placeholder="e.g., Hypertension Study Q4" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="GENDER" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl><SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem></SelectContent></Select></FormItem>)} />
                      <FormField control={form.control} name="RACE" render={({ field }) => (<FormItem><FormLabel>Race</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl><SelectContent><SelectItem value="white">White</SelectItem><SelectItem value="black">Black</SelectItem><SelectItem value="asian">Asian</SelectItem></SelectContent></Select></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="has_diabetes" render={({ field }) => (<FormItem><FormLabel>Has Diabetes</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></FormItem>)} />
                      <FormField control={form.control} name="has_hypertension" render={({ field }) => (<FormItem><FormLabel>Has Hypertension</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></FormItem>)} />
                    </div>
                     <FormField control={form.control} name="optional_diseases" render={({ field }) => (<FormItem><FormLabel>Other Diseases (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., Asthma, COPD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    {form.formState.errors.root && <p className="text-sm font-medium text-red-500 text-center">{form.formState.errors.root.message}</p>}
                    <DialogFooter><Button type="submit">Submit Request</Button></DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? <p>Loading datasets...</p> : error ? <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : datasets.length === 0 ? (<p className="text-center text-slate-500 py-8">You haven't created any datasets yet. Try requesting one!</p>) : (
            <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
               {datasets.map((dataset) => (
                <motion.div key={dataset._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">{dataset.name}<span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">{dataset.status}</span></CardTitle>
                      <CardDescription className="text-xs font-mono">{JSON.stringify(dataset.filtersUsed)}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow"><div className="text-sm text-slate-500 flex items-center"><FileClock className="w-4 h-4 mr-2" />Created on {dataset.createdAt}</div></CardContent>
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