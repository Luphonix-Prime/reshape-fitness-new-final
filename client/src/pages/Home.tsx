import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-2xl font-bold tracking-wider text-gold">RESHAPE</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Welcome, {user?.firstName || user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="border-gold text-gold hover:bg-gold hover:text-black"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-light mb-8 tracking-wider">
            WELCOME TO
            <br />
            <span className="text-gold font-medium">RESHAPE</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 font-light tracking-wide text-gray-300">
            Your luxury fitness journey continues
          </p>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-gold text-xl tracking-wider">
                {getRoleDisplayName()} Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">
                Access your personalized dashboard to manage your fitness journey.
              </p>
              <Button
                onClick={() => setLocation(getDashboardPath())}
                className="w-full bg-gold text-black hover:bg-white transition-all duration-300 font-medium tracking-widest uppercase"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          {user?.userType === 'member' && !user?.stripeSubscriptionId && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-gray-300 mb-4">
                  Complete your membership setup
                </p>
                <Button
                  onClick={() => setLocation('/subscribe')}
                  variant="outline"
                  className="w-full border-gold text-gold hover:bg-gold hover:text-black"
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