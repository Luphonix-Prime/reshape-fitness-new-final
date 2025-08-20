
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Car,
  Train,
  Wifi,
  Shield,
  Coffee,
  Users
} from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        interest: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const locations = [
    {
      name: "Manhattan Flagship",
      address: "432 Park Avenue, New York, NY 10016",
      phone: "(212) 555-0123",
      email: "manhattan@reshape.fitness",
      hours: "24/7 for Executive Members",
      parking: "Valet parking available",
      amenities: ["Spa", "Nutrition Bar", "Business Center", "Childcare"]
    },
    {
      name: "Beverly Hills",
      address: "9641 Sunset Boulevard, Beverly Hills, CA 90210",
      phone: "(310) 555-0124",
      email: "beverlyhills@reshape.fitness",
      hours: "5:00 AM - 11:00 PM",
      parking: "Complimentary valet",
      amenities: ["Outdoor Pool", "Spa", "Juice Bar", "Member Lounge"]
    },
    {
      name: "Miami Beach",
      address: "1200 Ocean Drive, Miami Beach, FL 33139",
      phone: "(305) 555-0125",
      email: "miamibeach@reshape.fitness",
      hours: "5:30 AM - 10:00 PM",
      parking: "Covered parking garage",
      amenities: ["Beach Access", "Rooftop Deck", "Spa", "Smoothie Bar"]
    },
    {
      name: "Chicago Loop",
      address: "233 S Wacker Drive, Chicago, IL 60606",
      phone: "(312) 555-0126",
      email: "chicago@reshape.fitness",
      hours: "5:00 AM - 11:00 PM",
      parking: "Underground parking",
      amenities: ["Executive Lounge", "Spa", "Café", "Recovery Suite"]
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      details: "1-800-RESHAPE",
      subtext: "Available 24/7 for members"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: "info@reshape.fitness",
      subtext: "We'll respond within 2 hours"
    },
    {
      icon: Users,
      title: "Membership",
      details: "memberships@reshape.fitness",
      subtext: "New member inquiries"
    },
    {
      icon: Shield,
      title: "Concierge",
      details: "concierge@reshape.fitness",
      subtext: "Premium member services"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wider">
              CONTACT <span className="text-gold font-medium">US</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ready to begin your transformation? Our team is here to guide you 
              every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            GET IN TOUCH
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center p-8">
                <CardContent className="p-0">
                  <method.icon className="h-16 w-16 text-gold mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">{method.title}</h3>
                  <p className="text-gold text-lg font-semibold mb-2">{method.details}</p>
                  <p className="text-gray-400 text-sm">{method.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold text-gold mb-8 tracking-wider">
                SEND US A MESSAGE
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-gold"
                    required
                  />
                  <Input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-gold"
                    required
                  />
                </div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-gold"
                  required
                />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-gold"
                  required
                />
                <select 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-md text-white focus:border-gold focus:outline-none"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="manhattan">Manhattan Flagship</option>
                  <option value="beverly-hills">Beverly Hills</option>
                  <option value="miami-beach">Miami Beach</option>
                  <option value="chicago">Chicago Loop</option>
                </select>
                <select 
                  name="interest"
                  value={formData.interest}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-md text-white focus:border-gold focus:outline-none"
                  required
                >
                  <option value="">I'm interested in...</option>
                  <option value="membership">Membership Information</option>
                  <option value="personal-training">Personal Training</option>
                  <option value="group-classes">Group Classes</option>
                  <option value="corporate">Corporate Memberships</option>
                  <option value="events">Private Events</option>
                </select>
                <Textarea
                  name="message"
                  placeholder="Tell us about your fitness goals..."
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-gold"
                  required
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold text-black hover:bg-white py-3 text-lg font-semibold tracking-wider transition-colors duration-300"
                >
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </Button>
              </form>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gold mb-8 tracking-wider">
                VISIT US TODAY
              </h3>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Experience the Reshape difference firsthand. Schedule your complimentary 
                tour and consultation with one of our fitness experts.
              </p>
              
              {/* Interactive Map */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
                <h4 className="text-lg font-semibold text-gold mb-4 text-center">Find Our Locations</h4>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968459391!3d40.75889297932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1580299779094!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
                <p className="text-sm text-gray-400 text-center mt-3">
                  Click on the map to view our gym locations and get directions
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Train className="h-6 w-6 text-gold mr-4" />
                  <span className="text-gray-300">Convenient public transportation access</span>
                </div>
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-gold mr-4" />
                  <span className="text-gray-300">Complimentary valet parking</span>
                </div>
                <div className="flex items-center">
                  <Wifi className="h-6 w-6 text-gold mr-4" />
                  <span className="text-gray-300">High-speed WiFi throughout</span>
                </div>
                <div className="flex items-center">
                  <Coffee className="h-6 w-6 text-gold mr-4" />
                  <span className="text-gray-300">Premium refreshment stations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-dark-gray">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            OUR LOCATIONS
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} className="bg-black/50 border-gold/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gold mb-6">{location.name}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gold mr-3 mt-1" />
                      <span className="text-gray-300">{location.address}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gold mr-3 mt-1" />
                      <span className="text-gray-300">{location.phone}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gold mr-3 mt-1" />
                      <span className="text-gray-300">{location.email}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gold mr-3 mt-1" />
                      <span className="text-gray-300">{location.hours}</span>
                    </div>
                    
                    <div className="flex items-start">
                      <Car className="h-5 w-5 text-gold mr-3 mt-1" />
                      <span className="text-gray-300">{location.parking}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {location.amenities.map((amenity, amenityIndex) => (
                        <span
                          key={amenityIndex}
                          className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 bg-gold text-black hover:bg-white">
                    Schedule Tour
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
