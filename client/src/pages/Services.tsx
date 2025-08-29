
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Dumbbell, 
  Heart, 
  Users, 
  Apple, 
  Sparkles, 
  Clock,
  Target,
  Waves,
  Zap,
  Trophy,
  Shield,
  Star
} from "lucide-react";

export default function Services() {
  const mainServices = [
    {
      icon: Dumbbell,
      title: "PERSONAL TRAINING",
      description: "One-on-one sessions with certified elite trainers",
      features: [
        "Customized workout programs",
        "Nutritional guidance",
        "Progress tracking & analysis",
        "Flexible scheduling",
        "Equipment orientation"
      ],
      price: "From $150/session",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: Users,
      title: "GROUP CLASSES",
      description: "Premium small-group fitness experiences",
      features: [
        "Maximum 8 participants",
        "Variety of class formats",
        "All skill levels welcome",
        "Premium equipment included",
        "Expert instruction"
      ],
      price: "From $45/class",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: Sparkles,
      title: "SPA & WELLNESS",
      description: "Luxury recovery and wellness services",
      features: [
        "Therapeutic massage",
        "Cryotherapy sessions",
        "Infrared sauna",
        "Recovery lounges",
        "Meditation spaces"
      ],
      price: "From $120/service",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: Apple,
      title: "NUTRITION COACHING",
      description: "Personalized nutrition and meal planning",
      features: [
        "Custom meal plans",
        "Supplement guidance",
        "Grocery shopping tours",
        "Cooking classes",
        "Regular check-ins"
      ],
      price: "From $200/month",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    }
  ];

  const classSchedule = [
    { time: "6:00 AM", class: "HIIT FUSION", instructor: "Marcus Johnson", duration: "45 min" },
    { time: "7:30 AM", class: "YOGA FLOW", instructor: "Lisa Chen", duration: "60 min" },
    { time: "12:00 PM", class: "STRENGTH TRAINING", instructor: "Sarah Mitchell", duration: "50 min" },
    { time: "5:30 PM", class: "BOXING CARDIO", instructor: "Alex Rivera", duration: "45 min" },
    { time: "7:00 PM", class: "PILATES CORE", instructor: "Emma Thompson", duration: "55 min" },
    { time: "8:30 PM", class: "RECOVERY STRETCH", instructor: "Lisa Chen", duration: "30 min" }
  ];

  const specialPrograms = [
    {
      icon: Trophy,
      title: "ATHLETE PERFORMANCE",
      description: "Elite training for competitive athletes",
      duration: "3-6 months"
    },
    {
      icon: Heart,
      title: "CARDIAC REHABILITATION",
      description: "Heart-healthy fitness programs",
      duration: "12 weeks"
    },
    {
      icon: Shield,
      title: "INJURY PREVENTION",
      description: "Biomechanical analysis and correction",
      duration: "4-8 weeks"
    },
    {
      icon: Target,
      title: "WEIGHT MANAGEMENT",
      description: "Comprehensive body composition transformation",
      duration: "3-6 months"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 sm:mb-8 tracking-wider">
              OUR <span className="text-gold font-medium">SERVICES</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Comprehensive wellness solutions designed for the discerning individual 
              who demands excellence in every aspect of their fitness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gold mb-12 sm:mb-16 tracking-wider">
            PREMIUM SERVICES
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {mainServices.map((service, index) => (
              <Card key={index} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-[4/3] lg:aspect-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gold mr-2 sm:mr-3" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-wider">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{service.description}</p>
                    <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-gray-300 text-xs sm:text-sm flex items-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <span className="text-gold font-bold text-base sm:text-lg">{service.price}</span>
                      <Button className="bg-gold text-black hover:bg-white text-sm sm:text-base px-4 py-2">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Class Schedule */}
      <section className="py-12 sm:py-16 lg:py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gold mb-12 sm:mb-16 tracking-wider">
            TODAY'S CLASS SCHEDULE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {classSchedule.map((session, index) => (
              <Card key={index} className="bg-black/50 border-gold/20">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gold">{session.time}</span>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{session.class}</h3>
                  <p className="text-gray-300 mb-2 text-sm sm:text-base">with {session.instructor}</p>
                  <p className="text-xs sm:text-sm text-gray-400">{session.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Button className="bg-gold text-black hover:bg-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              View Full Schedule
            </Button>
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gold mb-12 sm:mb-16 tracking-wider">
            SPECIALIZED PROGRAMS
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {specialPrograms.map((program, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center p-4 sm:p-6 lg:p-8">
                <CardContent className="p-0">
                  <program.icon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gold mx-auto mb-3 sm:mb-4 lg:mb-6" />
                  <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 tracking-wider">
                    {program.title}
                  </h3>
                  <p className="text-gray-300 mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm">{program.description}</p>
                  <p className="text-gold font-semibold text-xs sm:text-sm">{program.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Highlight */}
      <section className="py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            WORLD-CLASS FACILITIES
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-8 tracking-wider">
                EQUIPPED FOR EXCELLENCE
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Zap className="h-6 w-6 text-gold mr-4 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">CUTTING-EDGE EQUIPMENT</h4>
                    <p className="text-gray-300">
                      State-of-the-art Technogym, Hammer Strength, and custom-designed equipment
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Waves className="h-6 w-6 text-gold mr-4 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">RECOVERY SUITES</h4>
                    <p className="text-gray-300">
                      Infrared saunas, cold plunge pools, and massage therapy rooms
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Target className="h-6 w-6 text-gold mr-4 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">FUNCTIONAL TRAINING</h4>
                    <p className="text-gray-300">
                      Dedicated spaces for movement analysis and corrective exercise
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                alt="Gym Equipment"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                alt="Training Session"
                className="rounded-lg shadow-lg mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                alt="Recovery Area"
                className="rounded-lg shadow-lg -mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                alt="Group Class"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
