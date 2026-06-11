import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PawPrint, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useAuth();

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setLocation("/discover");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(registerData.email, registerData.password, registerData.name);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg("Check your email to confirm your account, then sign in.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome to Pawmate</h1>
          <p className="text-muted-foreground mt-2 text-sm">Find connections that start with paws.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 mb-5 text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 mb-5 text-sm text-center"
          >
            {successMsg}
          </motion.div>
        )}

        <Tabs defaultValue="signin" className="w-full" onValueChange={() => { setError(null); setSuccessMsg(null); }}>
          <TabsList className="grid w-full grid-cols-2 mb-8 h-11 bg-secondary rounded-full p-1">
            <TabsTrigger value="signin" className="rounded-full text-sm" data-testid="tab-signin">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full text-sm" data-testid="tab-register">Create Account</TabsTrigger>
          </TabsList>

          {/* Sign In */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="hello@example.com"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={signInData.email}
                  onChange={e => setSignInData(p => ({ ...p, email: e.target.value }))}
                  data-testid="input-signin-email"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    className="h-11 bg-background rounded-xl pr-11"
                    required
                    value={signInData.password}
                    onChange={e => setSignInData(p => ({ ...p, password: e.target.value }))}
                    data-testid="input-signin-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    data-testid="btn-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2"
                disabled={loading}
                data-testid="btn-signin-submit"
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* Create Account */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="register-name" className="text-sm font-medium">First Name</Label>
                <Input
                  id="register-name"
                  placeholder="Sarah"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={registerData.name}
                  onChange={e => setRegisterData(p => ({ ...p, name: e.target.value }))}
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="hello@example.com"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={registerData.email}
                  onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="h-11 bg-background rounded-xl pr-11"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={e => setRegisterData(p => ({ ...p, password: e.target.value }))}
                    data-testid="input-register-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                By creating an account you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2"
                disabled={loading}
                data-testid="btn-register-submit"
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl mt-5 text-sm font-medium border-border"
            type="button"
            data-testid="btn-google-auth"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
