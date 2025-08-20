
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Award, Users, Clock, MapPin, Star, Heart } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Users, label: "Active Members", value: "2,500+" },
    { icon: Award, label: "Years of Excellence", value: "15+" },
    { icon: Clock, label: "Operating Hours", value: "24/7" },
    { icon: MapPin, label: "Locations", value: "4" }
  ];

  const team = [
    {
      name: "Sarah Mitchell",
      role: "Head Trainer & Founder",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      bio: "15+ years of experience in elite fitness training",
      specialties: ["Strength Training", "Olympic Lifting", "Nutrition"]
    },
    {
      name: "Marcus Johnson",
      role: "Fitness Director",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      bio: "Former professional athlete turned fitness expert",
      specialties: ["HIIT", "Athletic Performance", "Injury Prevention"]
    },
    {
      name: "Dr. Lisa Chen",
      role: "Wellness Coordinator",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      bio: "PhD in Exercise Science and Rehabilitation",
      specialties: ["Recovery", "Physiotherapy", "Wellness Programs"]
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
              ABOUT <span className="text-gold font-medium">RESHAPE</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Where luxury meets performance. We don't just build bodies—we reshape lives, 
              one transformation at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold text-gold mb-8 tracking-wider">OUR MISSION</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                To redefine the fitness experience by creating an environment where luxury, 
                innovation, and results converge. We believe fitness is not just about physical 
                transformation—it's about empowering individuals to unlock their full potential.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Every member receives personalized attention, cutting-edge equipment, and 
                world-class facilities designed to inspire and motivate your journey to greatness.
              </p>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gold mb-8 tracking-wider">OUR VISION</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                To be the premier destination for discerning individuals who demand excellence 
                in their fitness journey. We envision a community where achievement knows no bounds 
                and every goal is within reach.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Through innovation, dedication, and unwavering commitment to quality, we're 
                building the future of luxury fitness—one member at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            BY THE NUMBERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center p-8">
                <CardContent className="p-0">
                  <stat.icon className="h-16 w-16 text-gold mx-auto mb-6" />
                  <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
                  <p className="text-gray-400 text-lg">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Reshape Fitness Story"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gold mb-8 tracking-wider">OUR STORY</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Founded in 2009 with a simple yet revolutionary idea: fitness should be an 
                experience, not just an activity. What started as a single premium facility 
                in Manhattan has evolved into a network of luxury fitness destinations.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Our founder, Sarah Mitchell, envisioned spaces where every detail matters—
                from the imported equipment to the ambient lighting, from the premium amenities 
                to the expertly crafted programs.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Today, Reshape Fitness stands as a testament to what happens when passion 
                meets precision, and where every member's success story becomes part of our legacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            MEET OUR EXPERTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-gold text-lg mb-4">{member.role}</p>
                  <p className="text-gray-300 mb-6">{member.bio}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gold tracking-wider uppercase">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, specIndex) => (
                        <span
                          key={specIndex}
                          className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            OUR VALUES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <Star className="h-16 w-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">EXCELLENCE</h3>
              <p className="text-gray-300 leading-relaxed">
                We pursue perfection in everything we do, from our facilities to our service, 
                ensuring every member experiences the highest standard of quality.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-16 w-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">COMMUNITY</h3>
              <p className="text-gray-300 leading-relaxed">
                We believe in the power of connection. Our community of like-minded individuals 
                supports, motivates, and inspires each other to achieve greatness.
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-16 w-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">WELLNESS</h3>
              <p className="text-gray-300 leading-relaxed">
                True fitness encompasses mind, body, and spirit. We provide holistic wellness 
                solutions that transform lives from the inside out.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
