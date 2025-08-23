import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Check } from "lucide-react";

export default function MembershipTiers() {
  const [, setLocation] = useLocation();

  const { data: membershipTiers, isLoading, error } = useQuery({
    queryKey: ['membershipTiers'],
    queryFn: async () => {
      const response = await fetch('/api/membership-tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch membership tiers');
      }
      return response.json();
    }
  });

  const handleSelectPlan = (tier: any) => {
    localStorage.setItem('selectedTier', JSON.stringify(tier));
    setLocation('/subscribe');
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto"></div>
        </div>
      </section>
    );
  }

  if (error || !membershipTiers || !Array.isArray(membershipTiers)) {
    return (
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-red-400">Failed to load membership tiers. Please try again later.</p>
        </div>
      </section>
    );
  }

  // Group tiers by training type
  const oneOnOneTiers = membershipTiers.filter(tier => tier.name.includes('ONE_ON_ONE'));
  const twoPeopleTiers = membershipTiers.filter(tier => tier.name.includes('TWO_PEOPLE'));
  const threePeopleTiers = membershipTiers.filter(tier => tier.name.includes('THREE_PEOPLE'));

  const renderTierSection = (tiers: any[], title: string, colorClass: string) => {
    if (!tiers || tiers.length === 0) return null;

    return (
      <div className="mb-20">
        <div className="text-center mb-12">
          <h3 className={`text-4xl md:text-5xl font-bold mb-4 tracking-wider ${colorClass}`}>
            {title}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card
              key={tier.id}
              className={`relative overflow-hidden group transition-all duration-300 hover:scale-105 ${
                index === 1 ? 'ring-2 ring-gold scale-105' : ''
              } bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-gold`}
            >
              {index === 1 && (
                <div className="absolute top-0 left-0 right-0 bg-gold text-black text-center py-2 text-sm font-bold tracking-wider">
                  MOST POPULAR
                </div>
              )}
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-gold mb-2">
                    {tier.sessions} Sessions
                  </h4>
                  <p className="text-gray-400 text-sm">({tier.duration})</p>
                  <div className="text-3xl font-bold text-white mb-2">
                    ₹{tier.price?.toLocaleString()}
                  </div>
                  <p className="text-gold font-semibold">
                    ₹{tier.oneOnOnePrice || tier.twoPeoplePrice || tier.threePeoplePrice} per session
                  </p>
                </div>

                {/* Pricing breakdown */}
                <div className="mb-6 space-y-1">
                  <div className="text-xs text-gray-300">
                    <span className="font-semibold">1 Person:</span> ₹{tier.oneOnOnePrice}/session
                  </div>
                  <div className="text-xs text-gray-300">
                    <span className="font-semibold">2 People:</span> ₹{tier.twoPeoplePrice}/session
                  </div>
                  <div className="text-xs text-gray-300">
                    <span className="font-semibold">3 People:</span> ₹{tier.threePeoplePrice}/session
                  </div>
                </div>

                <p className="text-gray-300 mb-4 text-sm">{tier.description}</p>

                <ul className="space-y-2 mb-6 text-left">
                  {tier.features?.slice(0, 4).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                      <Check className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                  {tier.features?.length > 4 && (
                    <li className="text-xs text-gray-400 text-center">
                      +{tier.features.length - 4} more features
                    </li>
                  )}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(tier)}
                  className="w-full py-3 tracking-widest uppercase transition-all duration-300 bg-gold text-black hover:bg-white font-medium relative overflow-hidden group text-sm"
                >
                  <span className="relative z-10">Choose Plan</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold via-yellow-300 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-wider">
            CHOOSE YOUR <span className="text-gold">EXPERIENCE</span>
          </h2>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-300 max-w-4xl mx-auto">
            Discover membership tiers designed to match your ambition. Each level offers exclusive access to premium facilities,
            personalized services, and transformative experiences.
          </p>
        </div>

        {renderTierSection(oneOnOneTiers, 'ONE ON ONE TRAINING', 'text-gold')}
        {renderTierSection(twoPeopleTiers, '2 PEOPLE TRAINING', 'text-blue-400')}
        {renderTierSection(threePeopleTiers, '3 PEOPLE TRAINING', 'text-green-400')}
      </div>
    </section>
  );
}