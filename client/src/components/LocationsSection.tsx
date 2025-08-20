export default function LocationsSection() {
  const locations = [
    {
      name: "MANHATTAN",
      address: "432 Park Avenue, New York, NY",
      description: "Open 24/7 for Executive members",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      name: "BEVERLY HILLS",
      address: "9641 Sunset Boulevard, CA",
      description: "Featuring exclusive spa services",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    },
    {
      name: "MIAMI BEACH",
      address: "1200 Ocean Drive, Miami, FL",
      description: "Oceanfront views and outdoor training",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
    }
  ];

  return (
    <section id="locations" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light mb-6 tracking-wider">
            LUXURY <span className="text-gold">LOCATIONS</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Premium facilities in the heart of the city's most prestigious neighborhoods
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <div key={index} className="group relative overflow-hidden">
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-2xl font-medium mb-2 tracking-wider text-gold">
                  {location.name}
                </h3>
                <p className="text-gray-300">{location.address}</p>
                <p className="text-gray-400 text-sm mt-2">{location.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
