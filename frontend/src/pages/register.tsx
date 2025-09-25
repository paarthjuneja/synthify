import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "@/components/ui/blur-fade";
import { RetroGrid } from "@/components/ui/retro-grid";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// --- Validation Schemas ---
const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const researcherSchema = baseSchema.extend({
  organization: z.string().optional(),
});

// --- Type Definitions ---
type ResearcherFormValues = z.infer<typeof researcherSchema>;
type AdminFormValues = z.infer<typeof baseSchema>;


// --- Reusable Form Components ---
const ResearcherRegisterForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ResearcherFormValues>({
    resolver: zodResolver(researcherSchema),
  });

  const onSubmit = async (data: ResearcherFormValues) => {
    try {
      const response = await api.post('/auth/register', { ...data, role: 'researcher' });
      await login(response.token);
      navigate('/dashboard/researcher');
    } catch (error) {
      console.error("Registration failed:", error);
      setApiError("An account with this email may already exist.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Register as a Researcher</CardTitle>
          <CardDescription>Create your account to access synthetic datasets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="organization">Organization (Optional)</Label><Input id="organization" {...register("organization")} /></div>
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} />{errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" {...register("password")} />{errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}</div>
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
        </CardContent>
        <CardFooter><Button type="submit" className="w-full">Create Account</Button></CardFooter>
      </Card>
    </form>
  );
};

const AdminRegisterForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<AdminFormValues>({
    resolver: zodResolver(baseSchema),
  });

  const onSubmit = async (data: AdminFormValues) => {
    try {
      const response = await api.post('/api/auth/register', { ...data, role: 'hospital_admin' });
      await login(response.token);
      navigate('/dashboard/admin');
    } catch (error) {
      console.error("Registration failed:", error);
      setApiError("An account with this email may already exist.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Register as an Admin</CardTitle>
          <CardDescription>Join the platform to provide valuable synthetic data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name-admin">Full Name</Label><Input id="name-admin" {...register("name")} />{errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="email-admin">Email</Label><Input id="email-admin" type="email" {...register("email")} />{errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="password-admin">Password</Label><Input id="password-admin" type="password" {...register("password")} />{errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}</div>
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
        </CardContent>
        <CardFooter><Button type="submit" className="w-full">Create Account</Button></CardFooter>
      </Card>
    </form>
  );
};


export function RegisterPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <RetroGrid/>
      <BlurFade>
        <Tabs defaultValue="researcher" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="researcher">Researcher</TabsTrigger>
            <TabsTrigger value="admin">Hospital Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="researcher">
            <ResearcherRegisterForm />
          </TabsContent>
          
          <TabsContent value="admin">
            <AdminRegisterForm />
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center text-sm text-white">
          Already have an account?{" "}
          <Link to="/login" className="underline font-semibold">
            Login
          </Link>
        </div>
      </BlurFade>
    </div>
  );
}