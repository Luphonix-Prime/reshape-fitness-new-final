import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-gray py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold tracking-wider text-gold mb-6">RESHAPE</h3>
            <p className="text-gray-400 leading-relaxed">
              Redefining luxury fitness experiences for the discerning individual who demands excellence.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 tracking-wider">LOCATIONS</h4>
            <ul className="space-y-3 text-gray-400">
              <li>Manhattan</li>
              <li>Beverly Hills</li>
              <li>Miami Beach</li>
              <li>Chicago</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/about" className="hover:text-gold transition-colors">About Us</a></li>
              <li><a href="/services" className="hover:text-gold transition-colors">Services</a></li>
              <li><a href="/contact" className="hover:text-gold transition-colors">Contact</a></li>
              <li><a href="/subscribe" className="hover:text-gold transition-colors">Membership</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-6 tracking-wider">CONNECT</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors duration-300">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              1-800-RESHAPE<br/>
              info@reshape.fitness
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Reshape Fitness. All rights reserved. Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
