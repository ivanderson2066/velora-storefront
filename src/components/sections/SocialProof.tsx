import { Star } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      id: 1,
      text: "The quality exceeded my expectations. Every detail feels intentional and well-crafted.",
      author: "Sarah M.",
      location: "New York",
      rating: 5,
    },
    {
      id: 2,
      text: "Finally found a brand that matches my aesthetic. Minimalist, functional, and beautiful.",
      author: "James L.",
      location: "London",
      rating: 5,
    },
    {
      id: 3,
      text: "Fast shipping and excellent customer service. Will definitely be ordering again.",
      author: "Emma K.",
      location: "Toronto",
      rating: 5,
    },
  ];

  return (
    <section className="velora-section bg-background">
      <div className="velora-container">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Reviews
          </p>
          <h2 className="velora-heading-lg mb-4">
            Trusted by Customers Worldwide
          </h2>
          <p className="velora-body max-w-xl mx-auto">
            Thousands of customers choose Velora for timeless design and reliable quality.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-secondary/50 rounded-sm p-8 hover:bg-secondary transition-colors duration-smooth"
            >
              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-foreground text-foreground"
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
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-sm">4.9/5 Average Rating</span>
            </div>
            <span className="text-sm">2,500+ Reviews</span>
            <span className="text-sm">Verified Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
