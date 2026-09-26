import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import Learning3D from "./pages/Learning3D.tsx";
import SolarSystem3D from "./pages/SolarSystem3D.tsx";
import Anatomy3D from "./pages/Anatomy3D.tsx";
import Molecules3D from "./pages/Molecules3D.tsx";
import Physics3D from "./pages/Physics3D.tsx";
import Earth3D from "./pages/Earth3D.tsx";
import DNA3D from "./pages/DNA3D.tsx";
import Crystal3D from "./pages/Crystal3D.tsx";
import CellDivision3D from "./pages/CellDivision3D.tsx";
import PeriodicTable3D from "./pages/PeriodicTable3D.tsx";
import HumanHeart3D from "./pages/HumanHeart3D.tsx";
import Volcano3D from "./pages/Volcano3D.tsx";
import WaterCycle3D from "./pages/WaterCycle3D.tsx";
import HumanBrain3D from "./pages/HumanBrain3D.tsx";
import Ecosystem3D from "./pages/Ecosystem3D.tsx";
import AITutor from "./pages/AITutor.tsx";
import VideoLessons from "./pages/VideoLessons.tsx";
import Quizzes from "./pages/Quizzes.tsx";
import ProgressPage from "./pages/ProgressPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import PricingPage from "./pages/PricingPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/3d" element={<ProtectedRoute><Learning3D /></ProtectedRoute>} />
            <Route path="/3d/solar-system" element={<ProtectedRoute><SolarSystem3D /></ProtectedRoute>} />
            <Route path="/3d/anatomy" element={<ProtectedRoute><Anatomy3D /></ProtectedRoute>} />
            <Route path="/3d/molecules" element={<ProtectedRoute><Molecules3D /></ProtectedRoute>} />
            <Route path="/3d/physics" element={<ProtectedRoute><Physics3D /></ProtectedRoute>} />
            <Route path="/3d/earth" element={<ProtectedRoute><Earth3D /></ProtectedRoute>} />
            <Route path="/3d/dna" element={<ProtectedRoute><DNA3D /></ProtectedRoute>} />
            <Route path="/3d/crystals" element={<ProtectedRoute><Crystal3D /></ProtectedRoute>} />
            <Route path="/3d/cell-division" element={<ProtectedRoute><CellDivision3D /></ProtectedRoute>} />
            <Route path="/3d/periodic-table" element={<ProtectedRoute><PeriodicTable3D /></ProtectedRoute>} />
            <Route path="/3d/heart" element={<ProtectedRoute><HumanHeart3D /></ProtectedRoute>} />
            <Route path="/3d/volcano" element={<ProtectedRoute><Volcano3D /></ProtectedRoute>} />
            <Route path="/3d/water-cycle" element={<ProtectedRoute><WaterCycle3D /></ProtectedRoute>} />
            <Route path="/3d/brain" element={<ProtectedRoute><HumanBrain3D /></ProtectedRoute>} />
            <Route path="/3d/ecosystem" element={<ProtectedRoute><Ecosystem3D /></ProtectedRoute>} />
            <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
            <Route path="/video-lessons" element={<ProtectedRoute><VideoLessons /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
