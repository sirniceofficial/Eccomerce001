import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderNotificationsProvider } from "@/components/OrderNotificationsProvider";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import StorePolicyPage from "./pages/StorePolicyPage";
import RewardsPage from "./pages/RewardsPage";
import OrdersPage from "./pages/OrdersPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthErrorLogsPage from "./pages/AuthErrorLogsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OrderNotificationsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/store-policy" element={<StorePolicyPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin/auth-logs" element={<AuthErrorLogsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OrderNotificationsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;