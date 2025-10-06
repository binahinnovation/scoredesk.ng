
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-emerald-50 p-3 sm:p-4 font-roboto">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="mb-6 sm:mb-8 text-center animate-fade-in">
          <Link to="/" className="inline-block mb-4 sm:mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-emerald-700 text-white p-2 sm:p-3 rounded-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <span className="font-bold text-2xl sm:text-3xl lg:text-4xl text-emerald-700">ScoreDesk</span>
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Sign in to your account</p>
        </div>
        
        <Card className="shadow-xl animate-slide-in hover-scale">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl sm:text-2xl text-center font-bold text-gray-900">Login</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base text-gray-600 font-medium">
                Enter your email and password to access your ScoreDesk account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base font-semibold text-gray-900">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@school.com" 
                  required 
                  className="h-11 sm:h-12 text-base transition-all focus-within:ring-2 focus-within:ring-emerald-500 border-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm sm:text-base font-semibold text-gray-900">Password</Label>
                  <Link to="/forgot-password" className="text-sm sm:text-base text-emerald-700 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="h-11 sm:h-12 text-base transition-all focus-within:ring-2 focus-within:ring-emerald-500 border-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                  className="h-5 w-5"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm sm:text-base font-medium text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 sm:h-14 bg-emerald-700 hover:bg-emerald-800 shadow-md text-base sm:text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="mt-2 text-center text-sm sm:text-base text-gray-600 font-medium">
                Don't have an account?{" "}
                <Link to="/signup" className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 font-medium">
          <p>🔒 Protected by industry standard encryption</p>
        </div>
      </div>
    </div>
  );
}
