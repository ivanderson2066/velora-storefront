const BrandStory = () => {
  return (
    <section id="about" className="velora-section bg-secondary/50">
      <div className="velora-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] bg-velora-sand/30 rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
                alt="Minimalist workspace with carefully curated items"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-velora-beige rounded-sm hidden lg:block" />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Our Philosophy
            </p>
            <h2 className="velora-heading-lg mb-6">
              Designed With
              <br />
              Purpose
            </h2>
            <div className="space-y-4">
              <p className="velora-body">
                At Velora, we believe everyday products should feel intentional.
              </p>
              <p className="velora-body">
                Each item in our collection is selected for its design, functionality, and ability to simplify modern life — without compromising style.
              </p>
              <p className="velora-body">
                We partner with artisans and manufacturers who share our commitment to quality, sustainability, and thoughtful craftsmanship.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border/50">
              <div>
                <p className="text-2xl font-semibold mb-1">50+</p>
                <p className="text-xs text-muted-foreground">Curated Products</p>
              </div>
              <div>
                <p className="text-2xl font-semibold mb-1">12k+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-semibold mb-1">30+</p>
                <p className="text-xs text-muted-foreground">Countries Shipped</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
