
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default function ConfirmEmailChange() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const token = urlParams.get('token');

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing email change token');
      setIsLoading(false);
      return;
    }

    // Confirm email change
    const confirmEmailChange = async () => {
      try {
        const response = await fetch(`/api/auth/confirm-email-change/${token}`);
        const data = await response.json();

        if (response.ok) {
          setIsSuccess(true);
          setMessage(data.message);
        } else {
          setIsSuccess(false);
          setMessage(data.message || 'Failed to confirm email change');
        }
      } catch (error) {
        setIsSuccess(false);
        setMessage('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmailChange();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden mx-auto"></div>
              <p className="text-gray-400">Confirming email change...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center flex items-center justify-center gap-2">
            <Mail className="h-6 w-6 text-golden" />
            Email Change Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto ${
              isSuccess ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isSuccess ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <XCircle className="h-6 w-6 text-white" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className={`text-lg font-semibold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {isSuccess ? 'Email Changed Successfully' : 'Email Change Failed'}
              </h3>
              
              <Alert className={isSuccess ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"}>
                <AlertDescription className={isSuccess ? "text-green-400" : "text-red-400"}>
                  {message}
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-golden hover:bg-golden/90 text-black font-semibold"
              >
                {isSuccess ? 'Continue to Login' : 'Back to Login'}
              </Button>
              
              {!isSuccess && (
                <Button 
                  onClick={() => navigate('/admin-dashboard')}
                  variant="outline" 
                  className="w-full border-gray-700 text-white hover:bg-gray-800"
                >
                  Back to Dashboard
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
