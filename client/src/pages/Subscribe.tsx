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
import Navigation from "@/components/Navigation";

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
        membershipTierId: selectedTier.id
      });

      const data = await response.json();

      // Invalidate user query to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      toast({
        title: "Welcome to Reshape Fitness!",
        description: `Your ${selectedTier.name} membership is now active.`,
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
    // Navigate to contact page for all membership inquiries
    setLocation('/contact');
  };

  // Effect to load selected tier from localStorage on component mount
  React.useEffect(() => {
    const storedTier = localStorage.getItem('selectedMembershipTier');
    if (storedTier) {
      setSelectedTier(JSON.parse(storedTier));
      setShowPaymentForm(true);
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

        <Navigation />

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
                      <h3 className="text-xl text-gold font-medium">{selectedTier.name} Membership</h3>
                      <p className="text-gray-300">Premium fitness experience</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light">${selectedTier.monthlyPrice}</div>
                      <div className="text-sm text-gray-400">per month</div>
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

      <Navigation />

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipTiers?.map((tier: any, index: number) => (
              <Card
                key={tier._id || tier.id || `tier-${index}`}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-gold/20 animate-fade-in"
                style={{animationDelay: `${index * 200}ms`}}
                onClick={() => handleTierSelect(tier)}
              >
                <CardContent className="p-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-medium mb-2 tracking-wider text-gold group-hover:text-white transition-colors duration-300">
                      {tier.name.toUpperCase()}
                    </h3>
                    <div className="mb-8 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-5xl font-light">${tier.monthlyPrice}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {tier.benefits?.map((benefit: string, idx: number) => (
                        <li key={idx} className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                          <CheckCircle className="w-5 h-5 text-gold mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full py-4 tracking-widest uppercase transition-all duration-300 bg-gold text-black hover:bg-white font-medium relative overflow-hidden group"
                    >
                      <span className="relative z-10">Select {tier.name}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-gold via-yellow-300 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}