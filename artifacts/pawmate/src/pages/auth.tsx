import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PawPrint, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { apiErrorMessage } from "@/lib/api-error";
import { useT } from "@/lib/i18n";

export default function Auth() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { refreshSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState(
    new URLSearchParams(search).get("tab") === "register" ? "register" : "signin",
  );

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const t = useT();
  const login = useLoginUser();
  const register = useRegisterUser();
  const isSubmitting = login.isPending || register.isPending;

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await login.mutateAsync({
        data: { email: signinEmail, password: signinPassword },
      });
      await refreshSession();
      setLocation(user.onboardingCompletedAt ? "/discover" : "/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, t("auth.couldNotSignIn")));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await register.mutateAsync({
        data: { email: registerEmail, password: registerPassword, firstName: registerName },
      });
      await refreshSession();
      setLocation("/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, t("auth.couldNotCreate")));
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
          <h1 className="font-serif text-3xl font-semibold text-foreground">{t("auth.welcome")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("auth.subtitle")}</p>
        </div>

        {error && (
          <div
            className="mb-6 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            data-testid="auth-error"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={tab} onValueChange={(value) => { setTab(value); setError(null); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-11 bg-secondary rounded-full p-1">
            <TabsTrigger value="signin" className="rounded-full text-sm" data-testid="tab-signin">{t("auth.signIn")}</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full text-sm" data-testid="tab-register">{t("auth.createAccount")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-sm font-medium">{t("auth.email")}</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="hello@example.com"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={signinEmail}
                  onChange={(e) => setSigninEmail(e.target.value)}
                  data-testid="input-signin-email"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="signin-password" className="text-sm font-medium">{t("auth.password")}</Label>
                  <Link
                    href="/reset-password"
                    className="text-xs text-primary hover:underline"
                    data-testid="link-forgot-password"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    className="h-11 bg-background rounded-xl pr-11"
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
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
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2"
                data-testid="btn-signin-submit"
              >
                {login.isPending ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="register-name" className="text-sm font-medium">{t("auth.firstName")}</Label>
                <Input
                  id="register-name"
                  placeholder="Sarah"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  data-testid="input-register-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-sm font-medium">{t("auth.email")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="hello@example.com"
                  className="h-11 bg-background rounded-xl"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  data-testid="input-register-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-password" className="text-sm font-medium">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordHint")}
                    className="h-11 bg-background rounded-xl pr-11"
                    required
                    minLength={10}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
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
                <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium mt-2"
                data-testid="btn-register-submit"
              >
                {register.isPending ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
