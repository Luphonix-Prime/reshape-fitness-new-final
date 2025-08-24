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

  const tiers = membershipTiers;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* One on One Training */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gold text-center">One on One</h3>
            {tiers.map((tier: any, index: number) => (
              <Card
                key={`one-on-one-${tier.id}`}
                className="bg-white/5 backdrop-blur-sm border border-gold/30 hover:border-gold/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-gold/20"
                onClick={() => handleSelectPlan({ ...tier, trainingType: 'one_on_one', price: tier.one_on_one_price })}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">{tier.sessions} Session</h4>
                    <p className="text-sm text-gray-400 mb-4">({tier.duration})</p>
                    <div className="text-3xl font-bold text-gold mb-2">₹{tier.one_on_one_price?.toLocaleString()}/-</div>
                    <p className="text-sm text-gray-300">(₹{tier.one_on_one_per_session} per session)</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2 People Training */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gray-300 text-center">2 People</h3>
            {tiers.map((tier: any, index: number) => (
              <Card
                key={`two-people-${tier.id}`}
                className="bg-white/5 backdrop-blur-sm border border-gray-400/30 hover:border-gray-400/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-gray-400/20"
                onClick={() => handleSelectPlan({ ...tier, trainingType: 'two_people', price: tier.two_people_price })}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">{tier.sessions} Session</h4>
                    <p className="text-sm text-gray-400 mb-4">({tier.duration})</p>
                    <div className="text-3xl font-bold text-gray-300 mb-2">₹{tier.two_people_price?.toLocaleString()}/-</div>
                    <p className="text-sm text-gray-300">(₹{tier.two_people_per_session} per session)</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 3 People Training */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-yellow-600 text-center">3 People</h3>
            {tiers.map((tier: any, index: number) => (
              <Card
                key={`three-people-${tier.id}`}
                className="bg-white/5 backdrop-blur-sm border border-yellow-600/30 hover:border-yellow-600/70 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-600/20"
                onClick={() => handleSelectPlan({ ...tier, trainingType: 'three_people', price: tier.three_people_price })}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">{tier.sessions} Session</h4>
                    <p className="text-sm text-gray-400 mb-4">({tier.duration})</p>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">₹{tier.three_people_price?.toLocaleString()}/-</div>
                    <p className="text-sm text-gray-300">(₹{tier.three_people_per_session} per session)</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}