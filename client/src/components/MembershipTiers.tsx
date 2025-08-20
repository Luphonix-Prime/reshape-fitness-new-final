import { Button } from "@/components/ui/button";
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
    // Store the selected tier in localStorage for the Subscribe page
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipTiers.map((tier, index) => (
            <div key={tier._id || tier.name || index} className={`relative p-8 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              index === 1
                ? 'border-gold bg-gradient-to-br from-gold/10 to-transparent'
                : 'border-white/20 bg-white/5'
            }`}>
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gold text-black px-4 py-1 text-sm font-bold tracking-wider uppercase rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-wider">{tier.name}</h3>
                <div className="text-4xl font-bold text-gold mb-4">
                  ${tier.monthlyPrice}<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300 mb-8">Premium {tier.name.toLowerCase()} membership</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.benefits?.map((benefit, benefitIndex) => (
                  <li key={`${tier.name}-benefit-${benefitIndex}`} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                    {benefit}
                  </li>
                )) || []}
              </ul>

              <Button
                className={`w-full py-3 font-semibold tracking-wider uppercase transition-all duration-300 ${
                  index === 1
                    ? 'bg-gold text-black hover:bg-white'
                    : 'border border-gold text-gold bg-transparent hover:bg-gold hover:text-black'
                }`}
                onClick={() => handleSelectPlan(tier)}
              >
                Choose {tier.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}