import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-wider">
          READY TO <span className="text-gold">RESHAPE</span><br/>
          YOUR LIFE?
        </h2>
        <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
          Join the elite few who understand that true fitness is a luxury experience
        </p>
        <div className="space-x-6">
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="bg-gold text-black px-12 py-4 text-lg font-medium tracking-widest uppercase hover:bg-white transition-all duration-500 transform hover:scale-105"
          >
            Schedule Tour
          </Button>
          <Button
            onClick={() => window.location.href = '/api/login'}
            variant="outline"
            className="border border-white text-white px-12 py-4 text-lg font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
