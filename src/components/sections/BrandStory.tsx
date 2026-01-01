const BrandStory = () => {
  return (
    <section id="about" className="velora-section bg-secondary/50">
      <div className="velora-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-accent/10 to-secondary rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
                alt="Smart home technology"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-lg hidden lg:block" />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              About MyxelHome
            </p>
            <h2 className="velora-heading-lg mb-6">
              Innovation Meets
              <br />
              Design
            </h2>
            <div className="space-y-4">
              <p className="velora-body">
                At MyxelHome, we believe technology should enhance your life without compromising on aesthetics.
              </p>
              <p className="velora-body">
                Each product in our collection is carefully selected for its innovative features, premium quality, and ability to transform everyday spaces into extraordinary experiences.
              </p>
              <p className="velora-body">
                From levitating displays to ambient lighting systems, we bring you the future of smart home living — designed for the modern American home.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border/50">
              <div>
                <p className="text-2xl font-semibold mb-1">7+</p>
                <p className="text-xs text-muted-foreground">Premium Products</p>
              </div>
              <div>
                <p className="text-2xl font-semibold mb-1">10k+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-semibold mb-1">USA</p>
                <p className="text-xs text-muted-foreground">Based Shipping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;