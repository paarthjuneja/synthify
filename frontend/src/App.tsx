import { Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/landing"; // We'll move the landing page content here
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register"; // Import the new page
import { ResearcherDashboard } from "@/pages/researcher-dashboard";
import { TimelineViewer } from "@/pages/timeline-viewer";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminDashboard } from "@/pages/admin-dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/researcher" element={<ResearcherDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/researcher/timeline/:datasetId" element={<TimelineViewer />} />
      </Route>
    </Routes>

  );
}

export default App;