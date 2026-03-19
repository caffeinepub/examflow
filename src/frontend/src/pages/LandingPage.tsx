import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  BookOpen,
  Clock,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { type AuthState, setAuth } from "../lib/auth";

interface Props {
  onLogin: (state: AuthState) => void;
}

export default function LandingPage({ onLogin }: Props) {
  const { actor } = useActor();
  // Student Registration
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Student Login
  const [stuUsername, setStuUsername] = useState("");
  const [stuPassword, setStuPassword] = useState("");
  const [stuLoading, setStuLoading] = useState(false);

  // Admin Login
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (regPassword.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    setRegLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable. Please try again.");
        return;
      }
      await actor.registerStudent(
        regUsername.trim(),
        regPassword,
        regName.trim(),
      );
      toast.success("Registration successful! You can now log in.");
      setRegName("");
      setRegUsername("");
      setRegPassword("");
    } catch (err: any) {
      const msg = (err?.message || String(err)) as string;
      if (msg.includes("already") || msg.includes("exists")) {
        toast.error("Username already taken. Please choose another.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuUsername.trim() || !stuPassword.trim()) {
      toast.error("Please enter username and password.");
      return;
    }
    setStuLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable. Please try again.");
        return;
      }
      const ok = await actor.studentLogin(stuUsername.trim(), stuPassword);
      if (ok) {
        const state: AuthState = {
          role: "student",
          studentUsername: stuUsername.trim(),
          studentName: stuUsername.trim(),
        };
        setAuth(state);
        onLogin(state);
        toast.success("Welcome back!");
      } else {
        toast.error("Invalid username or password.");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setStuLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      toast.error("Please enter username and password.");
      return;
    }
    setAdminLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable. Please try again.");
        return;
      }
      const ok = await actor.instructorLogin(
        adminUsername.trim(),
        adminPassword,
      );
      if (ok) {
        const state: AuthState = { role: "admin" };
        setAuth(state);
        onLogin(state);
        toast.success("Welcome, Instructor!");
      } else {
        toast.error("Invalid admin credentials.");
      }
    } catch {
      toast.error("Admin login failed. Please try again.");
    } finally {
      setAdminLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Smart Exams",
      desc: "Create and manage exams with ease",
    },
    {
      icon: Clock,
      title: "Timed Tests",
      desc: "Auto-submit when timer runs out",
    },
    {
      icon: BarChart3,
      title: "Instant Results",
      desc: "Scores calculated automatically",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      desc: "Role-based access control",
    },
    {
      icon: Users,
      title: "Student Tracking",
      desc: "Monitor all student progress",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ExamFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#get-started"
              className="hover:text-foreground transition-colors"
            >
              Get Started
            </a>
          </nav>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() =>
              document
                .getElementById("get-started")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Online Examination Platform
            </div>
            <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-6">
              Manage Exams
              <br />
              with Confidence
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              A powerful platform for instructors to create timed exams, add
              questions with correct answer marking, and track all student
              results in real time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() =>
                  document
                    .getElementById("get-started")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="hero.primary_button"
              >
                Start for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8"
                data-ocid="hero.secondary_button"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
              <div className="bg-primary/5 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">
                    Mathematics Final Exam
                  </span>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    45:00
                  </span>
                </div>
                <div className="space-y-3">
                  {(["What is 2 + 2?", "Solve for x: 3x = 9"] as string[]).map(
                    (q, qi) => (
                      <div
                        key={q}
                        className="bg-card rounded-lg p-3 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground mb-2">
                          {qi + 1}. {q}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {["A. 3", "B. 4", "C. 5", "D. 6"].map((opt) => (
                            <div
                              key={opt}
                              className={`text-xs px-2 py-1 rounded border ${opt === "B. 4" || opt === "A. 3" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  2 of 10 questions
                </span>
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="w-1/5 h-full bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Powerful tools for instructors and a smooth experience for students.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Card className="text-center p-6 shadow-card hover:shadow-card-hover transition-shadow border-border">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Auth Section */}
      <section id="get-started" className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Get Started
            </h2>
            <p className="text-muted-foreground">
              Register as a student or log in to your account
            </p>
          </div>

          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <Tabs defaultValue="register">
                <TabsList
                  className="grid grid-cols-3 w-full mb-6"
                  data-ocid="auth.tab"
                >
                  <TabsTrigger value="register" data-ocid="auth.register_tab">
                    Register
                  </TabsTrigger>
                  <TabsTrigger value="student" data-ocid="auth.student_tab">
                    Student Login
                  </TabsTrigger>
                  <TabsTrigger value="admin" data-ocid="auth.admin_tab">
                    Admin Login
                  </TabsTrigger>
                </TabsList>

                {/* Registration */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        placeholder="Enter your full name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        disabled={regLoading}
                        className="mt-1"
                        data-ocid="registration.name_input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="Choose a username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        disabled={regLoading}
                        className="mt-1"
                        data-ocid="registration.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={regLoading}
                        className="mt-1"
                        data-ocid="registration.password_input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={regLoading}
                      data-ocid="registration.submit_button"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Student Login */}
                <TabsContent value="student">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="stu-username">Username</Label>
                      <Input
                        id="stu-username"
                        placeholder="Enter your username"
                        value={stuUsername}
                        onChange={(e) => setStuUsername(e.target.value)}
                        disabled={stuLoading}
                        className="mt-1"
                        data-ocid="student_login.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stu-password">Password</Label>
                      <Input
                        id="stu-password"
                        type="password"
                        placeholder="Enter your password"
                        value={stuPassword}
                        onChange={(e) => setStuPassword(e.target.value)}
                        disabled={stuLoading}
                        className="mt-1"
                        data-ocid="student_login.password_input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={stuLoading}
                      data-ocid="student_login.submit_button"
                    >
                      {stuLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Admin Login */}
                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary mb-2">
                      <Shield className="inline w-4 h-4 mr-1" />
                      Admin access only. Contact your administrator for
                      credentials.
                    </div>
                    <div>
                      <Label htmlFor="admin-username">Admin Username</Label>
                      <Input
                        id="admin-username"
                        placeholder="Enter admin username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        disabled={adminLoading}
                        className="mt-1"
                        data-ocid="admin_login.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        disabled={adminLoading}
                        className="mt-1"
                        data-ocid="admin_login.password_input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={adminLoading}
                      data-ocid="admin_login.submit_button"
                    >
                      {adminLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Admin Login"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">ExamFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
