import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading spinner here
    return <div>Loading...</div>;
  }

  // If there is a user, render the child route (the dashboard).
  // Otherwise, redirect to the login page.
  return user ? <Outlet /> : <Navigate to="/login" />;
}