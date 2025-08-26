
export const cardVariants = {
  default: "glass-card hover:scale-[1.02] transition-all duration-300",
  premium: "premium-card hover:shadow-2xl hover:shadow-gold/20",
  interactive: "modern-card interactive-element",
  featured: "membership-featured neon-glow"
};

export const buttonVariants = {
  primary: "modern-button magnetic-button",
  ghost: "bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold transition-all duration-300",
  outline: "border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-black transition-all duration-300 hover:scale-105",
  gradient: "bg-gradient-to-r from-gold-dark to-gold-light text-black font-semibold hover:from-gold-light hover:to-gold shadow-lg hover:shadow-xl transition-all duration-300"
};

export const textVariants = {
  heading: "font-heading font-bold gradient-text",
  subheading: "font-inter font-semibold text-foreground/90",
  body: "font-inter text-foreground/80 leading-relaxed",
  caption: "font-inter text-sm text-muted-foreground"
};

export const animationVariants = {
  fadeIn: "animate-fade-in opacity-0",
  slideLeft: "animate-slide-in-left opacity-0",
  slideRight: "animate-slide-in-right opacity-0",
  stagger: "stagger-animation opacity-0",
  float: "animate-float"
};

export const glassEffects = {
  card: "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl",
  navigation: "glass-effect",
  overlay: "bg-black/80 backdrop-blur-xl"
};

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
