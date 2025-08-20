
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
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wider">
              OUR <span className="text-gold font-medium">SERVICES</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive wellness solutions designed for the discerning individual 
              who demands excellence in every aspect of their fitness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            PREMIUM SERVICES
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {mainServices.map((service, index) => (
              <Card key={index} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-square md:aspect-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <service.icon className="h-8 w-8 text-gold mr-3" />
                      <h3 className="text-2xl font-bold text-white tracking-wider">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-6">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-gray-300 text-sm flex items-center">
                          <Star className="h-4 w-4 text-gold mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center">
                      <span className="text-gold font-bold text-lg">{service.price}</span>
                      <Button className="bg-gold text-black hover:bg-white">
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
      <section className="py-20 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            TODAY'S CLASS SCHEDULE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classSchedule.map((session, index) => (
              <Card key={index} className="bg-black/50 border-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gold">{session.time}</span>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{session.class}</h3>
                  <p className="text-gray-300 mb-2">with {session.instructor}</p>
                  <p className="text-sm text-gray-400">{session.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button className="bg-gold text-black hover:bg-white px-8 py-3">
              View Full Schedule
            </Button>
          </div>
        </div>
      </section>

      {/* Special Programs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gold mb-16 tracking-wider">
            SPECIALIZED PROGRAMS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialPrograms.map((program, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center p-8">
                <CardContent className="p-0">
                  <program.icon className="h-16 w-16 text-gold mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4 tracking-wider">
                    {program.title}
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">{program.description}</p>
                  <p className="text-gold font-semibold text-sm">{program.duration}</p>
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
