import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Eventos from "./pages/Eventos";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DashboardIndex from "./pages/DashboardIndex";
import { AuthProvider } from "./contexts/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import MembersPage from "./pages/MembersPage";
import EventsPage from "./pages/EventsPage";
import FinancesPage from "./pages/FinancesPage";
import FamiliesPage from "./pages/FamiliesPage";
import FamilyTreeViewPage from "./pages/FamilyTreeViewPage";
import EventDetailPage from "./pages/EventDetailPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import RegistrationConfirmationPage from "./pages/RegistrationConfirmationPage";
import EventRegistrationsPage from "./pages/EventRegistrationsPage";
import CellsPage from "./pages/CellsPage";
import PublicCellsPage from "./pages/PublicCellsPage";
import CoursesPage from "./pages/CoursesPage";
import LessonsPage from "./pages/LessonsPage";
import PublicCoursesPage from "./pages/PublicCoursesPage";
import CourseStudentViewPage from "./pages/CourseStudentViewPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import VisitorsPage from "./pages/VisitorsPage";
import MemberJourneyPage from "./pages/MemberJourneyPage";
import PatrimonioPage from "./pages/PatrimonioPage";
import PublicAgendaPage from "./pages/PublicAgendaPage";
import PastoralAgendaPage from "./pages/PastoralAgendaPage";
import AconselhamentoPage from "./pages/AconselhamentoPage";
import AconselhamentoAdminPage from "./pages/AconselhamentoAdminPage";
import BibliotecaPage from "./pages/BibliotecaPage";
import PublicBibliotecaPage from "./pages/PublicBibliotecaPage";
import VoluntariadoAdminPage from "./pages/VoluntariadoAdminPage";
import PortalLayout from "./components/portal/PortalLayout";
import PortalIndex from "./pages/portal/PortalIndex";
import PortalCursosPage from "./pages/portal/PortalCursosPage";
import PortalCelulaPage from "./pages/portal/PortalCelulaPage";
import PortalPerfilPage from "./pages/portal/PortalPerfilPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import PatrimonioSettingsPage from "./pages/PatrimonioSettingsPage";
import SettingsLayout from "./components/settings/SettingsLayout";
import AppearancePage from "./pages/settings/AppearancePage";
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import GenerosidadeAdminPage from "./pages/GenerosidadeAdminPage";
import LouvorPage from "./pages/LouvorPage";
import EscalasPage from "./pages/EscalasPage";
import EscalaDetailPage from "./pages/EscalaDetailPage";
import Galeria from "./pages/Galeria";
import Semear from "./pages/Semear";
import EditorPage from "./pages/EditorPage";
import PortalVoluntariadoPage from "./pages/portal/PortalVoluntariadoPage";
import MuralDaGenerosidadePage from "./pages/portal/MuralDaGenerosidadePage";
import HallDaGenerosidadePage from "./pages/portal/HallDaGenerosidadePage";
import PedirAjudaPage from "./pages/portal/PedirAjudaPage";
import CongregationsPage from "./pages/CongregationsPage";
import SermonsPage from "./pages/SermonsPage";
import PublicSermonsPage from "./pages/PublicSermonsPage";
import BibliaPage from "./pages/BibliaPage";
import GovernanceLayout from "./components/governance/GovernanceLayout";
import PermissionsPage from "./pages/governance/PermissionsPage";
import HierarchyPage from "./pages/governance/HierarchyPage";
import SecurityPage from "./pages/governance/SecurityPage";
import AuditLogPage from "./pages/governance/AuditLogPage";

const queryClient = new QueryClient();
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AuthProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/celulas" element={<PublicCellsPage />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/eventos/:id" element={<EventDetailPage />} />
                  <Route path="/cursos" element={<PublicCoursesPage />} />
                  <Route path="/agenda" element={<PublicAgendaPage />} />
                  <Route path="/aconselhamento" element={<AconselhamentoPage />} />
                  <Route path="/biblioteca" element={<PublicBibliotecaPage />} />
                  <Route path="/galeria" element={<Galeria />} />
                  <Route path="/semear" element={<Semear />} />
                  <Route path="/contato" element={<Contato />} />
                  <Route path="/pregacoes" element={<PublicSermonsPage />} />
                  <Route path="/biblia" element={<BibliaPage />} />
                  <Route path="/inscricao/:id" element={<RegistrationConfirmationPage />} />
                  <Route path="/payment/success" element={<PaymentStatusPage />} />
                  <Route path="/payment/failure" element={<PaymentStatusPage />} />
                  <Route path="/payment/pending" element={<PaymentStatusPage />} />
                </Route>
                
                <Route path="/login" element={<Login />} />
                <Route path="/editor" element={<EditorPage />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/cursos/:id" element={<CourseStudentViewPage />} />
                    <Route path="/cursos/:courseId/aula/:lessonId" element={<CoursePlayerPage />} />
                  </Route>

                  <Route element={<PortalLayout />}>
                    <Route path="/portal" element={<PortalIndex />} />
                    <Route path="/portal/cursos" element={<PortalCursosPage />} />
                    <Route path="/portal/celula" element={<PortalCelulaPage />} />
                    <Route path="/portal/perfil" element={<PortalPerfilPage />} />
                    <Route path="/portal/voluntariado" element={<PortalVoluntariadoPage />} />
                    <Route path="/portal/mural" element={<MuralDaGenerosidadePage />} />
                    <Route path="/portal/mural/hall-da-fama" element={<HallDaGenerosidadePage />} />
                    <Route path="/portal/mural/pedir-ajuda" element={<PedirAjudaPage />} />
                  </Route>

                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardIndex />} />
                    <Route path="/dashboard/louvor" element={<LouvorPage />} />
                    <Route path="/dashboard/louvor/escalas" element={<EscalasPage />} />
                    <Route path="/dashboard/louvor/escalas/:id" element={<EscalaDetailPage />} />
                    <Route path="/dashboard/agenda" element={<PastoralAgendaPage />} />
                    <Route path="/dashboard/aconselhamento" element={<AconselhamentoAdminPage />} />
                    <Route path="/dashboard/generosidade" element={<GenerosidadeAdminPage />} />
                    <Route path="/dashboard/visitors" element={<VisitorsPage />} />
                    <Route path="/dashboard/members" element={<MembersPage />} />
                    <Route path="/dashboard/journey" element={<MemberJourneyPage />} />
                    <Route path="/dashboard/events" element={<EventsPage />} />
                    <Route path="/dashboard/events/:id/registrations" element={<EventRegistrationsPage />} />
                    <Route path="/dashboard/cells" element={<CellsPage />} />
                    <Route path="/dashboard/finances" element={<FinancesPage />} />
                    <Route path="/dashboard/families" element={<FamiliesPage />} />
                    <Route path="/dashboard/families/tree" element={<FamilyTreeViewPage />} />
                    <Route path="/dashboard/courses" element={<CoursesPage />} />
                    <Route path="/dashboard/courses/:id/lessons" element={<LessonsPage />} />
                    <Route path="/dashboard/patrimonio" element={<PatrimonioPage />} />
                    <Route path="/dashboard/patrimonio/settings" element={<PatrimonioSettingsPage />} />
                    <Route path="/dashboard/patrimonio/:id" element={<AssetDetailPage />} />
                    <Route path="/dashboard/biblioteca" element={<BibliotecaPage />} />
                    <Route path="/dashboard/voluntariado" element={<VoluntariadoAdminPage />} />
                    <Route path="/dashboard/congregations" element={<CongregationsPage />} />
                    <Route path="/dashboard/sermoes" element={<SermonsPage />} />
                    
                    <Route path="/dashboard/settings" element={<SettingsLayout />}>
                      <Route index element={<Navigate to="appearance" replace />} />
                      <Route path="appearance" element={<AppearancePage />} />
                      <Route path="profile" element={<ProfileSettingsPage />} />
                    </Route>

                    <Route path="/dashboard/governance" element={<GovernanceLayout />}>
                      <Route index element={<Navigate to="permissions" replace />} />
                      <Route path="permissions" element={<PermissionsPage />} />
                      <Route path="hierarchy" element={<HierarchyPage />} />
                      <Route path="security" element={<SecurityPage />} />
                      <Route path="audit-logs" element={<AuditLogPage />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </GoogleReCaptchaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;