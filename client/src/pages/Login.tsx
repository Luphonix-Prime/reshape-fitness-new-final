import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // State to store and display errors

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const result = await login(loginData.email, loginData.password);
      console.log("Login successful:", result);

      // Get user type from the result for proper routing
      const userType = result.user?.userType || result.user?.user_type || result.user?.role;
      console.log("User type:", userType);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.user?.firstName || 'User'}!`,
      });

      // Use window.location for more reliable navigation
      if (userType === 'admin') {
        console.log("Redirecting to admin dashboard");
        window.location.href = '/admin-dashboard';
      } else if (userType === 'trainer') {
        console.log("Redirecting to trainer dashboard");
        window.location.href = '/trainer-dashboard';
      } else {
        console.log("Redirecting to member dashboard");
        window.location.href = '/member-dashboard';
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error?.message || "Login failed. Please check your credentials and try again.";
      setError(errorMessage); // Set the error message state
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    // Add signup logic here
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 border-gold/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gold">RESHAPE FITNESS</CardTitle>
          <CardDescription className="text-gray-300">
            Access your premium fitness experience
          </CardDescription>
          <Button
            onClick={() => setLocation('/landing')}
            variant="ghost"
            size="sm"
            className="text-gold hover:text-white mt-2"
          >
            ← Back to Landing Page
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-gold data-[state=active]:text-black">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-white data-[state=active]:bg-gold data-[state=active]:text-black">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gold/20">
                <p className="text-xs text-gray-300 mb-1">Demo Credentials:</p>
                <p className="text-xs text-gold">Admin: admin / admin</p>
                <p className="text-xs text-gold">Trainer: trainer / trainer</p>
                <p className="text-xs text-gold">Member: member / member</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Username/Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter username or email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error message */}
                <Button 
                  type="submit" 
                  className="w-full bg-gold text-black hover:bg-gold/90 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-gold hover:text-gold/80 underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gold text-black hover:bg-gold/90 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}