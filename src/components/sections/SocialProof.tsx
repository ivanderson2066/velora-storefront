import { Star } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      id: 1,
      text: "The levitating clock is absolutely stunning! It's become the centerpiece of my living room. Amazing quality.",
      author: "Michael R.",
      location: "California, USA",
      rating: 5,
    },
    {
      id: 2,
      text: "Best humidifier I've ever owned. The rain sounds are so relaxing and the night light is perfect.",
      author: "Jennifer S.",
      location: "Texas, USA",
      rating: 5,
    },
    {
      id: 3,
      text: "Fast shipping and the jellyfish lamp exceeded my expectations. My kids absolutely love it!",
      author: "David K.",
      location: "Florida, USA",
      rating: 5,
    },
  ];

  return (
    <section className="velora-section bg-background">
      <div className="velora-container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Customer Reviews
          </p>
          <h2 className="velora-heading-lg mb-4">
            Loved by Thousands
          </h2>
          <p className="velora-body max-w-xl mx-auto">
            Join over 10,000 happy customers who have transformed their homes with MyxelHome.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-secondary/50 rounded-lg p-8 hover:bg-secondary transition-colors duration-smooth"
            >
              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                <p className="text-sm font-medium">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm">4.9/5 Average Rating</span>
            </div>
            <span className="text-sm">10,000+ Customers</span>
            <span className="text-sm">🇺🇸 Ships from USA</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;