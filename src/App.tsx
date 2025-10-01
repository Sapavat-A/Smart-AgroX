import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LanguageObserver from "@/components/common/LanguageObserver";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/custom.css";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import SoilLab from "./pages/SoilLab";
import CropAdvisor from "./pages/CropAdvisor";
import DiseaseScan from "./pages/DiseaseScan";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import AgriBot from "./pages/AgriBot";
import Founders from "./pages/Founders";
import Farm from "./pages/Farm";
import AgroVision from "./pages/AgroVision";
import AgriBuddy from './pages/AgriBuddy';
import YieldPredictionPage from './pages/YieldPredictionPage';
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FirebaseInit from "./components/firebase/FirebaseInit";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* Initialize Firebase and listen for auth state changes */}
      <FirebaseInit />
      <LanguageProvider>
        <LanguageObserver>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" closeButton richColors />
            <BrowserRouter>
            <Routes>
              {/* Index page accessible without authentication */}
              <Route path="/" element={<Index />} />
              
              {/* Protected routes that require authentication */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Sidebar navigation routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/soil-lab" element={<SoilLab />} />
              <Route path="/crop-advisor" element={<CropAdvisor />} />
              <Route path="/disease-scan" element={<DiseaseScan />} />
              <Route path="/market" element={<Market />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/agribot" element={<AgriBot />} />
              <Route path="/founders" element={<Founders />} />
              <Route path="/farm" element={<Farm />} />
              <Route path="/agrovision" element={<AgroVision />} />
              <Route path="/agribuddy" element={<AgriBuddy />} />
              <Route path="/yield-prediction" element={<YieldPredictionPage />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageObserver>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
