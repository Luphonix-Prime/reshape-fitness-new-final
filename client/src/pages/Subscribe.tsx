import React, { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { CheckCircle, CreditCard, User, Mail, Phone } from "lucide-react";

const StaticPaymentForm = ({ selectedTier }: { selectedTier: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create membership
      const response = await apiRequest("POST", "/api/create-membership", {
        membershipTierId: selectedTier.id,
        trainingType: selectedTier.trainingType, // Include training type
      });

      const data = await response.json();

      // Invalidate user query to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      toast({
        title: "Welcome to Reshape Fitness!",
        description: `Your ${selectedTier.name} membership (${selectedTier.trainingType}) is now active.`,
      });

      setTimeout(() => {
        setLocation('/dashboard');
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Membership Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Modern Card Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-medium text-gold tracking-wider">PAYMENT DETAILS</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="cardNumber" className="text-sm text-gray-300 mb-2 block">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
              className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate" className="text-sm text-gray-300 mb-2 block">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold"
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="text-sm text-gray-300 mb-2 block">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nameOnCard" className="text-sm text-gray-300 mb-2 block">Name on Card</Label>
            <Input
              id="nameOnCard"
              type="text"
              placeholder="John Doe"
              value={formData.nameOnCard}
              onChange={(e) => setFormData({...formData, nameOnCard: e.target.value})}
              className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-gold" />
          <h3 className="text-lg font-medium text-gold tracking-wider">CONTACT INFO</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold pl-10"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-white/5 border-white/20 text-white placeholder-gray-500 focus:border-gold pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Animated Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gold text-black hover:bg-white transition-all duration-300 font-medium tracking-widest uppercase py-4 relative overflow-hidden group"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div>
          </div>
        )}
        <span className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} flex items-center justify-center space-x-2`}>
          <CheckCircle className="w-5 h-5" />
          <span>Activate {selectedTier?.name} Membership</span>
        </span>
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: membershipTiers, isLoading: tiersLoading, error } = useQuery({
    queryKey: ['/api/membership-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/membership-tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch membership tiers');
      }
      return response.json();
    }
  });

  const handleTierSelect = async (tier: any) => {
    // Redirect to contact us page
    setLocation('/contact');
  };

  // Effect to load selected tier from localStorage on component mount
  React.useEffect(() => {
    const storedTier = localStorage.getItem('selectedMembershipTier');
    if (storedTier) {
      try {
        setSelectedTier(JSON.parse(storedTier));
        setShowPaymentForm(true);
      } catch (error) {
        console.error('Failed to parse stored tier:', error);
        localStorage.removeItem('selectedMembershipTier');
      }
    }
  }, []);


  if (tiersLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !membershipTiers || !Array.isArray(membershipTiers)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gold mb-4">Unable to Load Membership Options</h2>
          <p className="text-gray-300 mb-6">Please try refreshing the page or contact support.</p>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (showPaymentForm && selectedTier) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 glass-effect relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <h1 className="text-2xl font-bold tracking-wider text-gold">RESHAPE</h1>
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                size="sm"
                className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </nav>

        <div className="pt-20 min-h-screen flex items-center justify-center relative z-10">
          <div className="max-w-2xl mx-auto px-6 py-20">
            <div className="mb-12">
              <Button
                onClick={() => {
                  setSelectedTier(null);
                  setShowPaymentForm(false);
                  localStorage.removeItem('selectedMembershipTier'); // Clear localStorage
                }}
                variant="ghost"
                className="text-gold hover:text-white mb-6 hover:bg-white/10 transition-all duration-300"
              >
                ← Back to Membership Selection
              </Button>

              <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wider">
                COMPLETE YOUR
                <br />
                <span className="text-gold font-medium bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                  SUBSCRIPTION
                </span>
              </h1>

              <Card className="bg-white/5 backdrop-blur-sm border border-gold/20 mb-8 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl text-gold font-medium">{selectedTier.sessions} Sessions Package</h3>
                      <p className="text-gray-300">{selectedTier.duration} • {selectedTier.trainingType?.replace('_', ' ').toUpperCase()} Training</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-gold">Premium</div>
                      <div className="text-sm text-gray-400">fitness experience</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-8">
                <StaticPaymentForm selectedTier={selectedTier} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-2xl font-bold tracking-wider text-gold">RESHAPE</h1>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              size="sm"
              className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Membership Selection */}
      <section className="pt-32 pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-light mb-8 tracking-wider animate-fade-in">
              CHOOSE YOUR
              <br />
              <span className="text-gold font-medium bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                MEMBERSHIP
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto opacity-90">
              Select the membership tier that aligns with your fitness journey and lifestyle aspirations.
            </p>
          </div>

          {/* Training Session Terms & Conditions */}
          <div className="mb-16">
            <Card className="bg-white/5 backdrop-blur-sm border border-gold/20 hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gold text-center">
                  TRAINING SESSION TERMS & CONDITIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Each training session is designed to be <span className="text-gold font-semibold">50 minutes long</span>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p><span className="text-gold font-semibold">Full payment</span> must be made before the first session begins.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Packages are <span className="text-gold font-semibold">non-refundable and non-transferable</span>.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>All sessions must be used within the <span className="text-gold font-semibold">validity period</span> mentioned in the package. Expired sessions will not be carried.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Clients must inform us at least <span className="text-gold font-semibold">24 hours in advance</span> to reschedule a session. Late cancellations or no-shows will count as a completed session.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Clients with existing medical conditions must provide a <span className="text-gold font-semibold">doctor's clearance</span> before starting membership.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Clients are expected to <span className="text-gold font-semibold">arrive on time</span> for sessions. Late arrivals will result in shorter sessions without any adjustment in price.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>Inform the trainer immediately of any <span className="text-gold font-semibold">discomfort, pain, or unusual feelings</span> during workouts. Follow the trainer's instructions to avoid injury.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p><span className="text-gold font-semibold">Consistent effort and adherence</span> to the trainer's guidance are essential for achieving results.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <p>The fitness studio is <span className="text-gold font-semibold">not responsible for injuries</span> resulting from non-compliance with instructions or external activities.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-12 max-w-7xl mx-auto">
            {/* One on One Section */}
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gold mb-8">ONE ON ONE TRAINING</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {membershipTiers?.map((tier: any) => (
                  <Card
                    key={`one-on-one-${tier.id}`}
                    className="bg-white/5 backdrop-blur-sm border border-gold/30 hover:border-gold/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-gold/20"
                    onClick={() => handleTierSelect({...tier, trainingType: 'one_on_one'})}
                  >
                    <CardContent className="p-6 relative">
                      <div className="text-center">
                        <h4 className="text-3xl font-bold text-white mb-4">
                          {tier.sessions} Sessions
                        </h4>
                        <p className="text-lg text-gray-300">
                          {tier.duration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 2 People Section */}
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-300 mb-8">2 PEOPLE TRAINING</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {membershipTiers?.map((tier: any) => (
                  <Card
                    key={`two-people-${tier.id}`}
                    className="bg-white/5 backdrop-blur-sm border border-gray-400/30 hover:border-gray-400/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-gray-400/20"
                    onClick={() => handleTierSelect({...tier, trainingType: 'two_people'})}
                  >
                    <CardContent className="p-6 relative">
                      <div className="text-center">
                        <h4 className="text-3xl font-bold text-white mb-4">
                          {tier.sessions} Sessions
                        </h4>
                        <p className="text-lg text-gray-300">
                          {tier.duration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 3 People Section */}
            <div className="text-center">
              <h3 className="text-4xl font-bold text-yellow-600 mb-8">3 PEOPLE TRAINING</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {membershipTiers?.map((tier: any) => (
                  <Card
                    key={`three-people-${tier.id}`}
                    className="bg-white/5 backdrop-blur-sm border border-yellow-600/30 hover:border-yellow-600/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-600/20"
                    onClick={() => handleTierSelect({...tier, trainingType: 'three_people'})}
                  >
                    <CardContent className="p-6 relative">
                      <div className="text-center">
                        <h4 className="text-3xl font-bold text-white mb-4">
                          {tier.sessions} Sessions
                        </h4>
                        <p className="text-lg text-gray-300">
                          {tier.duration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}