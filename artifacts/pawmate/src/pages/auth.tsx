import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const [, setLocation] = useLocation();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/discover");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-card-border p-8 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-8">
          <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome to Pawmate</h1>
          <p className="text-muted-foreground mt-2">Find your pack.</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-secondary rounded-full p-1">
            <TabsTrigger value="signin" className="rounded-full" data-testid="tab-signin">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full" data-testid="tab-register">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" placeholder="hello@example.com" className="h-12 bg-background rounded-xl" required data-testid="input-signin-email" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="signin-password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                </div>
                <Input id="signin-password" type="password" className="h-12 bg-background rounded-xl" required data-testid="input-signin-password" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-base mt-2" data-testid="btn-signin-submit">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">First Name</Label>
                <Input id="register-name" placeholder="Sarah" className="h-12 bg-background rounded-xl" required data-testid="input-register-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input id="register-email" type="email" placeholder="hello@example.com" className="h-12 bg-background rounded-xl" required data-testid="input-register-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input id="register-password" type="password" className="h-12 bg-background rounded-xl" required data-testid="input-register-password" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-base mt-2" data-testid="btn-register-submit">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 rounded-xl mt-6 font-medium border-border" type="button" data-testid="btn-google-auth">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
