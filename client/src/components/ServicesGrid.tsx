export default function ServicesGrid() {
  const services = [
    {
      title: "PERSONAL TRAINING",
      description: "One-on-one sessions with world-class trainers who understand that excellence is personal.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "GROUP CLASSES",
      description: "Exclusive classes designed to challenge and inspire, limited to ensure personalized attention.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "SPA & WELLNESS",
      description: "Recovery and rejuvenation services that complement your fitness journey with luxury amenities.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "NUTRITION COACHING",
      description: "Personalized nutrition plans crafted by experts who understand that fuel is as important as form.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "PREMIUM EQUIPMENT",
      description: "State-of-the-art equipment and technology that sets the standard for luxury fitness experiences.",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      title: "CONCIERGE SERVICES",
      description: "From towel service to appointment scheduling, every detail is handled with sophistication.",
      image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    }
  ];

  return (
    <section id="services" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light mb-6 tracking-wider">
            PREMIUM <span className="text-gold">SERVICES</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience unparalleled luxury in every aspect of your fitness journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group premium-card p-8"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover mb-6 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <h3 className="text-2xl font-medium mb-4 tracking-wider text-gold">
                {service.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
