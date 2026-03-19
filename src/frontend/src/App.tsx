import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { type AuthState, clearAuth, getAuth } from "./lib/auth";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  const [auth, setAuthState] = useState<AuthState | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = getAuth();
    setAuthState(stored);
    setInitialized(true);
  }, []);

  const handleLogin = (state: AuthState) => {
    setAuthState(state);
  };

  const handleLogout = () => {
    clearAuth();
    setAuthState(null);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {!auth && <LandingPage onLogin={handleLogin} />}
      {auth?.role === "admin" && <AdminDashboard onLogout={handleLogout} />}
      {auth?.role === "student" && (
        <StudentDashboard
          studentName={auth.studentName ?? "Student"}
          studentUsername={auth.studentUsername ?? ""}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
