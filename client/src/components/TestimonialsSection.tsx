export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Reshape Fitness isn't just a gym—it's a lifestyle transformation. The attention to detail and personalized approach is unmatched.",
      name: "JAMES HENDERSON",
      title: "Executive Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
    },
    {
      quote: "The level of luxury and expertise here is extraordinary. My trainer understands exactly what I need to achieve my goals.",
      name: "ALEXANDRA CHEN",
      title: "All Access Member",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
              />
              <blockquote className="text-xl italic mb-6 text-gray-300">
                "{testimonial.quote}"
              </blockquote>
              <div className="text-gold font-medium tracking-wider">
                {testimonial.name}
              </div>
              <div className="text-gray-400 text-sm">{testimonial.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
