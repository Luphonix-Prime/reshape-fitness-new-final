import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navigateToPage = (path: string) => {
    window.location.href = path;
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-wider text-gold">RESHAPE</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => navigateToPage('/')}
                className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Home
              </button>
              <button 
                onClick={() => navigateToPage('/about')}
                className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                About
              </button>
              <button 
                onClick={() => navigateToPage('/services')}
                className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Services
              </button>
              <button 
                onClick={() => navigateToPage('/subscribe')}
                className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Membership
              </button>
              <button 
                onClick={() => navigateToPage('/contact')}
                className="text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Contact
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Button
                onClick={logout}
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-black transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Logout
              </Button>
            )}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gold"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => navigateToPage('/')}
                className="block px-3 py-2 text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Home
              </button>
              <button
                onClick={() => navigateToPage('/about')}
                className="block px-3 py-2 text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                About
              </button>
              <button
                onClick={() => navigateToPage('/services')}
                className="block px-3 py-2 text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Services
              </button>
              <button
                onClick={() => navigateToPage('/subscribe')}
                className="block px-3 py-2 text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Membership
              </button>
              <button
                onClick={() => navigateToPage('/contact')}
                className="block px-3 py-2 text-white hover:text-gold transition-colors duration-300 text-sm font-medium tracking-widest uppercase"
              >
                Contact
              </button>
              <div className="mt-4 px-3">
                {user && (
                  <Button
                    onClick={logout}
                    className="w-full border border-gold text-gold hover:bg-gold hover:text-black font-medium text-sm tracking-widest uppercase transition-colors duration-300"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
