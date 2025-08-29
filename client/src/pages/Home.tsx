import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Navigation component for demonstration purposes
const Navigation = () => (
  <nav className="fixed top-0 w-full z-50 glass-effect">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <h1 className="text-2xl font-bold tracking-wider text-gold">RESHAPE</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">Welcome, User</span>
          <Button
            variant="outline"
            size="sm"
            className="border-gold text-gold hover:bg-gold hover:text-black"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (user && user.userType) {
      console.log("User detected in Home, redirecting to dashboard for:", user.userType);
      switch (user.userType) {
        case 'admin':
          setLocation('/admin-dashboard');
          break;
        case 'trainer':
          setLocation('/trainer-dashboard');
          break;
        case 'member':
          setLocation('/member-dashboard');
          break;
        default:
          setLocation('/member-dashboard');
          break;
      }
    }
  }, [user, setLocation]);

  const getRoleDisplayName = () => {
    switch (user?.userType) {
      case 'member':
        return 'Member';
      case 'trainer':
        return 'Trainer';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  const getDashboardPath = () => {
    switch (user?.userType) {
      case 'member':
        return '/member-dashboard';
      case 'trainer':
        return '/trainer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/member-dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <Navigation />

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light mb-6 sm:mb-8 tracking-wider">
            WELCOME TO
            <br />
            <span className="text-gold font-medium">RESHAPE</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 font-light tracking-wide text-gray-300">
            Your luxury fitness journey continues
          </p>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 max-w-md mx-auto mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-gold text-lg sm:text-xl tracking-wider">
                {getRoleDisplayName()} Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Access your personalized dashboard to manage your fitness journey.
              </p>
              <Button
                onClick={() => setLocation(getDashboardPath())}
                className="w-full bg-gold text-black hover:bg-white transition-all duration-300 font-medium tracking-widest uppercase text-sm sm:text-base py-2 sm:py-3"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {user?.userType === 'member' && !user?.stripeSubscriptionId && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 max-w-md mx-auto">
              <CardContent className="pt-4 sm:pt-6">
                <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                  Complete your membership setup
                </p>
                <Button
                  onClick={() => setLocation('/subscribe')}
                  variant="outline"
                  className="w-full border-gold text-gold hover:bg-gold hover:text-black text-sm sm:text-base py-2 sm:py-3"
                >
                  Choose Membership
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}