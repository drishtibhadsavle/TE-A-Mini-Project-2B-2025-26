import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import SnapShelfPage from "./pages/SnapShelfPage";
import HistoryPage from "./pages/HistoryPage";
import RecommendPage from "./pages/RecommendPage";
import FeedbackPage from "./pages/FeedbackPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import SavedBooksPage from "./pages/SavedBooksPage";
import SplashCursor from "./components/SplashCursor";
import { PageTransition } from "./components/PageTransition";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/home" element={<ProtectedRoute><PageTransition><HomePage /></PageTransition></ProtectedRoute>} />
        <Route path="/snapshelf" element={<ProtectedRoute><PageTransition><SnapShelfPage /></PageTransition></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><PageTransition><HistoryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/recommend" element={<ProtectedRoute><PageTransition><RecommendPage /></PageTransition></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><PageTransition><SavedBooksPage /></PageTransition></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><PageTransition><SearchPage /></PageTransition></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><PageTransition><FeedbackPage /></PageTransition></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><PageTransition><AboutPage /></PageTransition></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SplashCursor />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
