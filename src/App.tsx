
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ClaimOrder from "./pages/ClaimOrder";
import PaypalReturn from "./pages/PaypalReturn";
import CustomerAccount from "./pages/customer/CustomerAccount";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerProfile from "./pages/customer/CustomerProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVariationGroups from "./pages/admin/AdminVariationGroups";
import AdminMenuOrdering from "./pages/admin/AdminMenuOrdering";
import AdminQRCode from "./pages/admin/AdminQRCode";
import Login from "./pages/Login";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import Register from "./pages/Register";
import { CartProvider } from "./contexts/CartContext";
import { UserProvider } from "./contexts/UserContext";
import { StoreProvider } from "./contexts/StoreContext";
import { TenantProvider } from "./contexts/TenantContext";
import AdminRoute from "./components/AdminRoute";
import CustomerRoute from "./components/CustomerRoute";
import NewStore from "./pages/NewStore";
import SuperAdmin from "./pages/admin/SuperAdmin";
import BlogLanding from "./pages/BlogLanding";
import PlanCheckout from "./pages/PlanCheckout";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import SobreNosotros from "./pages/SobreNosotros";
import Contacto from "./pages/Contacto";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiesPolicy from "./pages/legal/CookiesPolicy";

// Initialize QueryClient outside of the component
const queryClient = new QueryClient();

// Use HashRouter automatically when app is not served at root (e.g., GitHub Pages)
const useHashRouter = import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/';
const RouterComponent = useHashRouter ? HashRouter : BrowserRouter;

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <CartProvider>
        <RouterComponent>
          <TenantProvider>
          <StoreProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Navigate to="/blog" replace />} />
                {/* Rotas multi-tenant por slug */}
                <Route path="/:slug" element={<Index />} />
                <Route path="/:slug/product/:id" element={<ProductDetail />} />
                <Route path="/:slug/cart" element={<Cart />} />
                <Route path="/:slug/checkout" element={<Checkout />} />
                <Route path="/:slug/paypal-return" element={<PaypalReturn />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/paypal-return" element={<PaypalReturn />} />
                <Route path="/claim-order" element={<ClaimOrder />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-register" element={<AdminRegister />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas do cliente */}
                <Route path="/customer" element={<CustomerRoute />}>
                  <Route path="" element={<CustomerAccount />} />
                  <Route path="orders" element={<CustomerOrders />} />
                  <Route path="profile" element={<CustomerProfile />} />
                </Route>
                
                {/* Rotas do administrador */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route path="" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="variation-groups" element={<AdminVariationGroups />} />
                  <Route path="menu-ordering" element={<AdminMenuOrdering />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="qrcode" element={<AdminQRCode />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                <Route path="/blog" element={<BlogLanding />} />
                <Route path="/blog/articulos" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/checkout-plan" element={<PlanCheckout />} />
                <Route path="/novo" element={<NewStore />} />
                <Route path="/superadmin" element={<SuperAdmin />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/terminos" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </StoreProvider>
          </TenantProvider>
        </RouterComponent>
      </CartProvider>
    </UserProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
