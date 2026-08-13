import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { PawPrint, Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestPasswordReset, useConfirmPasswordReset } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="flex items-center gap-2 mb-8">
        <PawPrint className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl font-semibold text-foreground">Pawmate</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-card border border-border rounded-[1.5rem] p-8 shadow-sm"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Step one: ask for the link. */
function RequestForm() {
  const { toast } = useToast();
  const requestReset = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await requestReset.mutateAsync({ data: { email } });
      setSent(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't send the link",
        description: apiErrorMessage(err, "Please try again."),
      });
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4" data-testid="reset-request-sent">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <MailCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Check your email</h1>
        {/* Worded so it stays true whether or not that address has an account —
            the server answers the same either way, on purpose. */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          If there's a Pawmate account for {email}, a link to choose a new password is on its
          way. It works for one hour.
        </p>
        <Link href="/login" className="inline-block text-sm text-primary hover:underline pt-2">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Give us the address you signed up with and we'll send a link to set a new one.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="hello@example.com"
          className="h-11 bg-background rounded-xl"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-reset-email"
        />
      </div>
      <Button
        type="submit"
        disabled={requestReset.isPending}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        data-testid="btn-reset-request"
      >
        {requestReset.isPending ? "Sending…" : "Send the link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </form>
  );
}

/** Step two: arrive from the emailed link and choose the password. */
function ConfirmForm({ token }: { token: string }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const confirmReset = useConfirmPasswordReset();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) return;

    try {
      await confirmReset.mutateAsync({ data: { token, password } });
      toast({
        title: "Password changed",
        description: "You've been signed out everywhere else. Sign in with the new one.",
      });
      navigate("/login");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't change the password",
        description: apiErrorMessage(err, "Ask for a fresh link and try again."),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Choose a new password</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          At least six characters. Signing in anywhere else will need the new one.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="text-sm font-medium">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={show ? "text" : "password"}
            className="h-11 bg-background rounded-xl pr-11"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="input-new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
            data-testid="btn-toggle-new-password"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="text-sm font-medium">Repeat it</Label>
        <Input
          id="confirm-password"
          type={show ? "text" : "password"}
          className="h-11 bg-background rounded-xl"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          data-testid="input-confirm-password"
        />
        {mismatch && (
          <p className="text-xs text-destructive" data-testid="text-password-mismatch">
            These two don't match.
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={confirmReset.isPending || mismatch || password.length < 6}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        data-testid="btn-reset-confirm"
      >
        {confirmReset.isPending ? "Saving…" : "Set the password"}
      </Button>
    </form>
  );
}

export default function ResetPassword() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");

  return <Shell>{token ? <ConfirmForm token={token} /> : <RequestForm />}</Shell>;
}
