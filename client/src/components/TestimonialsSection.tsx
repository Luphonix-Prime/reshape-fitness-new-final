export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Reshape Fitness transformed my life completely. The personalized training and nutritional guidance helped me achieve what I never thought possible.",
      hoverQuote: "From 85kg to 70kg in 6 months! The trainers here understand the Indian lifestyle and dietary preferences perfectly.",
      name: "ARJUN SHARMA",
      title: "Premium Member",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
    },
    {
      quote: "The level of expertise and attention to detail is extraordinary. My fitness journey has been incredible here.",
      hoverQuote: "As a working professional, the flexible timings and personalized workout plans fit perfectly into my busy schedule. Lost 15kg and gained confidence!",
      name: "PRIYA PATEL",
      title: "Elite Member",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
    },
    {
      quote: "Reshape Fitness understands the unique challenges of Indian lifestyle and creates solutions that actually work.",
      hoverQuote: "Being a software engineer with long sitting hours, I developed back issues. The corrective exercise program here completely resolved my problems!",
      name: "VIKRAM SINGH",
      title: "Wellness Member",
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
    },
    {
      quote: "The nutritional guidance considering Indian food habits made all the difference in my transformation.",
      hoverQuote: "I never had to give up my favorite dal-chawal or roti. The trainers helped me modify portions and timing - lost 20kg while enjoying Indian cuisine!",
      name: "SNEHA REDDY",
      title: "Transform Member",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
    }
  ];

  return (
    <section className="py-32 bg-dark-gray">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light mb-6 tracking-wider">
            MEMBER <span className="text-gold">STORIES</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hear from those who've redefined their limits
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group text-center bg-black/30 p-8 rounded-lg border border-gray-700 hover:border-gold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:bg-black/50 modern-card interactive-element"
            >
              <div className="relative mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-gray-600 group-hover:border-gold transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <blockquote className="text-lg italic mb-6 text-gray-300 min-h-[120px] flex items-center justify-center relative overflow-hidden">
                <span className="block group-hover:opacity-0 transition-opacity duration-300">
                  "{testimonial.quote}"
                </span>
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold">
                  "{testimonial.hoverQuote}"
                </span>
              </blockquote>
              
              <div className="text-gold font-medium tracking-wider group-hover:text-white transition-colors duration-300">
                {testimonial.name}
              </div>
              <div className="text-gray-400 text-sm group-hover:text-gold transition-colors duration-300">
                {testimonial.title}
              </div>
              
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
