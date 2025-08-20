import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesGrid from "@/components/ServicesGrid";
import MembershipTiers from "@/components/MembershipTiers";
import LocationsSection from "@/components/LocationsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="bg-black text-white font-inter">
      <Navigation />
      <HeroSection />
      
      {/* Philosophy Section */}
      <section className="py-32 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-12 tracking-wider">
            ELEVATE YOUR <span className="text-gold">POTENTIAL</span>
          </h2>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-300 max-w-4xl mx-auto">
            At Reshape Fitness, we don't just build bodies—we craft experiences. Our philosophy transcends traditional fitness, 
            creating a sanctuary where luxury meets performance, where every detail is designed to inspire your transformation.
          </p>
        </div>
      </section>

      <ServicesGrid />
      <MembershipTiers />
      <LocationsSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </div>
  );
}
