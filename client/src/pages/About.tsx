
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Award, Users, Clock, MapPin, Star, Heart } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Users, label: "Active Members", value: "800+" },
    { icon: Award, label: "Years of Experience", value: "8+" },
    { icon: Clock, label: "Classes Per Week", value: "40+" },
    { icon: MapPin, label: "Studio Locations", value: "4" }
  ];

  const owner = {
    name: "Mandar Somani",
    role: "Owner & Founder",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    bio: "Passionate fitness enthusiast and entrepreneur dedicated to helping people achieve their health and wellness goals through personalized training and support.",
    specialties: ["Business Leadership", "Fitness Management", "Member Relations", "Studio Operations"]
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 sm:mb-8 tracking-wider">
              ABOUT <span className="text-gold font-medium">RESHAPE</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Your local fitness studio dedicated to helping you achieve your health and fitness goals 
              in a supportive, motivating environment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 lg:py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gold mb-6 sm:mb-8 tracking-wider">OUR MISSION</h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                To provide accessible, effective fitness programs that help our community achieve 
                lasting health and wellness. We believe fitness should be enjoyable, sustainable, 
                and tailored to each individual's needs and goals.
              </p>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Our experienced trainers provide personalized guidance, motivation, and support 
                to help you build healthy habits that last a lifetime.
              </p>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gold mb-6 sm:mb-8 tracking-wider">OUR VISION</h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                To be the go-to fitness studio in our community, known for our welcoming atmosphere, 
                expert instruction, and genuine care for each member's success.
              </p>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                We strive to create a fitness community where everyone feels supported, 
                motivated, and empowered to reach their personal best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gold mb-12 sm:mb-16 tracking-wider">
            BY THE NUMBERS
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center p-4 sm:p-6 lg:p-8">
                <CardContent className="p-0">
                  <stat.icon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gold mx-auto mb-3 sm:mb-4 lg:mb-6" />
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{stat.value}</h3>
                  <p className="text-gray-400 text-sm sm:text-base lg:text-lg">{stat.label}</p>
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
                Founded in 2016 with a passion for helping people discover their strength and 
                potential. What started as a small local studio has grown into a trusted 
                fitness community with multiple locations.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Our founder, Mandar Somani, believed that fitness should be accessible, enjoyable, 
                and results-driven. We focus on creating programs that work for real people 
                with real lives.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Today, Reshape Fitness Studio continues to grow, driven by our members' 
                success stories and our commitment to helping each person achieve their goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gold mb-12 sm:mb-16 tracking-wider">
            MEET THE OWNER
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={owner.image}
                    alt={owner.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{owner.name}</h3>
                  <p className="text-gold text-base sm:text-lg mb-3 sm:mb-4">{owner.role}</p>
                  <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{owner.bio}</p>
                  <div className="space-y-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-gold tracking-wider uppercase">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {owner.specialties.map((specialty, specIndex) => (
                        <span
                          key={specIndex}
                          className="bg-gold/20 text-gold px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
