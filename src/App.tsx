import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Eventos from "./pages/Eventos";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DashboardIndex from "./pages/DashboardIndex";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import MembersPage from "./pages/MembersPage";
import EventsPage from "./pages/EventsPage";
import FinancesPage from "./pages/FinancesPage";
import EventDetailPage from "./pages/EventDetailPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import RegistrationConfirmationPage from "./pages/RegistrationConfirmationPage";
import EventRegistrationsPage from "./pages/EventRegistrationsPage";
import CellsPage from "./pages/CellsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/eventos/:id" element={<EventDetailPage />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/inscricao/:id" element={<RegistrationConfirmationPage />} />
              <Route path="/payment/success" element={<PaymentStatusPage />} />
              <Route path="/payment/failure" element={<PaymentStatusPage />} />
              <Route path="/payment/pending" element={<PaymentStatusPage />} />
            </Route>
            
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardIndex />} />
                <Route path="/dashboard/members" element={<MembersPage />} />
                <Route path="/dashboard/events" element={<EventsPage />} />
                <Route path="/dashboard/events/:id/registrations" element={<EventRegistrationsPage />} />
                <Route path="/dashboard/cells" element={<CellsPage />} />
                <Route path="/dashboard/finances" element={<FinancesPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;