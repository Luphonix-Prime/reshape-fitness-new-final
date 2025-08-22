
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message);
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-golden hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <CardTitle className="text-2xl text-white">Forgot Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSuccess ? (
            <>
              <div className="text-center space-y-2">
                <Mail className="h-12 w-12 text-golden mx-auto" />
                <p className="text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>

                {message && (
                  <Alert className={isSuccess ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"}>
                    <AlertDescription className={isSuccess ? "text-green-400" : "text-red-400"}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-golden hover:bg-golden/90 text-black font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Check Your Email</h3>
                <p className="text-gray-400">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  The link will expire in 15 minutes and can only be used once.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
