import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToNextSection = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <h1 className="text-6xl md:text-8xl font-light mb-6 leading-tight tracking-wider">
          IT'S NOT FITNESS.<br/>
          <span className="text-gold font-medium">IT'S LIFE.</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 font-light tracking-wide text-gray-300">
          Redefine what it means to be fit
        </p>
        <Button
          onClick={() => window.location.href = '/api/login'}
          className="bg-gold text-black px-12 py-4 text-lg font-medium tracking-widest uppercase hover:bg-white transition-all duration-500 transform hover:scale-105"
        >
          Start Your Journey
        </Button>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button onClick={scrollToNextSection}>
          <ChevronDown className="text-white text-2xl w-8 h-8" />
        </button>
      </div>
    </section>
  );
}
