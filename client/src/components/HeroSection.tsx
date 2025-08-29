import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, Trophy, Play, Zap, ArrowRight } from "lucide-react";
import { cardVariants, buttonVariants, textVariants, animationVariants } from "@/lib/styles";

export default function HeroSection() {
  const scrollToNextSection = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[10s] hover:scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-0 animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="relative">
          <Zap className="h-10 w-10 text-gold" />
          <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>
      <div className="absolute bottom-32 right-16 animate-float opacity-0 animate-fade-in" style={{ animationDelay: '2s' }}>
        <div className="relative">
          <Trophy className="h-14 w-14 text-gold" />
          <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl animate-pulse" />
        </div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float opacity-0 animate-fade-in" style={{ animationDelay: '3s' }}>
        <Sparkles className="h-8 w-8 text-gold/60" />
      </div>

      {/* Enhanced Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="opacity-0 animate-fade-in">
          <h1 className={`${textVariants.heading} text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-wider`}>
            FORGE YOUR <span className="gradient-text inline-block animate-shimmer">LEGEND</span>
          </h1>
        </div>

        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className={`${textVariants.body} text-xl md:text-2xl font-light leading-relaxed text-gray-200 mb-12 max-w-4xl mx-auto`}>
            Step into a world where <span className="text-gold font-semibold">strength meets luxury</span>. 
            Our premium facilities and expert guidance transform ordinary moments into 
            <span className="text-gold font-semibold"> extraordinary achievements</span>.
          </p>
        </div>

        <div className="opacity-0 animate-fade-in flex flex-col sm:flex-row gap-6 justify-center items-center mb-20" style={{ animationDelay: '0.6s' }}>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/contact'}
            className={`${buttonVariants.primary} px-12 py-6 text-lg font-bold tracking-wide`}
          >
            <Sparkles className="mr-3 h-6 w-6" />
            Start Your Journey
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>

          <Button 
            size="lg" 
            className={`${buttonVariants.outline} px-12 py-6 text-lg font-semibold tracking-wide`}
          >
            <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
            Watch Our Story
          </Button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { number: "2500+", label: "Active Members", delay: "0.9s" },
            { number: "15+", label: "Years Experience", delay: "1.1s" },
            { number: "24/7", label: "Premium Access", delay: "1.3s" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`${cardVariants.default} text-center p-6 opacity-0 animate-fade-in hover:scale-110 transition-transform duration-300`}
              style={{ animationDelay: stat.delay }}
            >
              <div className={`${textVariants.heading} text-4xl md:text-5xl font-black mb-3 animate-shimmer`}>
                {stat.number}
              </div>
              <div className={`${textVariants.caption} uppercase tracking-widest font-medium`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button onClick={scrollToNextSection}>
          <ChevronDown className="text-white text-2xl w-8 h-8" />
        </button>
      </div>
    </section>
  );
}