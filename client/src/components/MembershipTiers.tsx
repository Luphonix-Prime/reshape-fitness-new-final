import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Check } from "lucide-react";

// Assuming CheckCircle and Card/CardContent are imported from shadcn/ui or similar
// For this example, we'll use placeholders for Card and CardContent if they are not directly relevant to the core changes.
// If they are essential, their implementation details would be needed.
// For now, we will focus on the data structure and rendering logic based on the provided changes.

// Placeholder for Card and CardContent if they were part of the original structure and not explicitly shown in the changes
// If these are indeed part of the original, they should be rendered correctly.
// Given the changes focus on the grid and card content, we'll assume these are standard UI components.

// Let's assume `Card` and `CardContent` are components that take `className`, `children`, etc.
// And `CheckCircle` is a variant of `Check`.

// Mock CheckCircle if not provided and assuming it's similar to Check
const CheckCircle = Check;

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

  // The original code mapped through membershipTiers and filtered them by type (ONE_ON_ONE, TWO_PEOPLE, etc.)
  // The new changes seem to imply a flat structure of `tiers` that already includes all types and session counts.
  // We need to adapt the mapping based on the new structure provided in the changes, assuming `tiers` is the data to map.
  // If `membershipTiers` needs to be transformed into the `tiers` structure expected by the new changes, that transformation would be needed here.
  // Assuming the `membershipTiers` fetched from the API already conforms to the structure implied by the `<new_str>`'s `tiers` variable.
  const tiers = membershipTiers; // Directly use fetched data as `tiers`

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

        {/* The following section replaces the original filtering and mapping for each training type */}
        {/* The new structure from the changes expects a single mapping over a `tiers` array */}
        {/* We need to ensure the fetched `membershipTiers` data is processed to fit the `tiers` structure expected by the new mapping. */}
        {/* For now, we'll assume `membershipTiers` directly maps to the structure described in `<new_str>` */}

        {/* Placeholder for Card and CardContent if they are not standard components */}
        {/* Assuming these are available and correctly imported */}
        {/* If Card and CardContent were custom components in the original, their definitions would be needed. */}
        {/* For the purpose of this diff, we'll assume they are standard and their usage remains similar */}
        {/* The actual structure of Card/CardContent might need adjustment based on their definition. */}
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
                  <h3 className="text-2xl font-bold text-gold mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-white mb-2">
                    ₹{tier.price?.toLocaleString()}
                  </div>
                  <p className="text-gray-400 text-sm">{tier.duration}</p>
                  <p className="text-gold font-semibold mt-2">{tier.sessions} Sessions</p>
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
                  {tier.features?.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                      <CheckCircle className="w-4 h-4 text-gold mr-2 flex-shrink-0" />
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
                  onClick={() => handleSelectPlan(tier)} // Use handleSelectPlan from the original scope
                  className="w-full py-3 tracking-widest uppercase transition-all duration-300 bg-gold text-black hover:bg-white font-medium relative overflow-hidden group text-sm"
                >
                  <span className="relative z-10">Choose {tier.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold via-yellow-300 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Assuming Card and CardContent are defined elsewhere or are standard imports.
// If they were custom components in the original file and not provided,
// a minimal definition might be needed for the code to be complete,
// but the prompt implies merging based on provided changes.
// For the sake of completeness and assuming standard shadcn/ui usage:
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg ${className}`}>{children}</div>;
}

function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}