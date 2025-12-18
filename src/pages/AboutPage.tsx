import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Zap, Shield, Truck, Award } from "lucide-react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description: "We curate cutting-edge smart home technology that transforms everyday living into extraordinary experiences.",
    },
    {
      icon: Shield,
      title: "Quality First",
      description: "Every product is rigorously tested to meet our high standards before reaching your doorstep.",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "We ship directly from our US warehouse, ensuring quick delivery and reliable tracking.",
    },
    {
      icon: Award,
      title: "Customer Satisfaction",
      description: "Your happiness is our priority. We offer a 30-day money-back guarantee on all products.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | MyxelHome</title>
        <meta name="description" content="Learn about MyxelHome - your trusted source for innovative smart home technology. Discover our mission to transform modern living." />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="bg-background">
        {/* Hero Section */}
        <section className="velora-section">
          <div className="velora-container">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Our Story
              </p>
              <h1 className="velora-heading-lg mb-6">
                Transforming Homes,<br />Elevating Lives
              </h1>
              <p className="velora-body text-muted-foreground">
                At MyxelHome, we believe your home should be a sanctuary of comfort, 
                innovation, and style. We curate the finest smart home products from 
                around the world, bringing you technology that makes everyday living 
                more enjoyable.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                  Our Mission
                </p>
                <h2 className="velora-heading-md mb-6">
                  Making Smart Living Accessible
                </h2>
                <p className="velora-body text-muted-foreground mb-6">
                  We started MyxelHome with a simple vision: to bring innovative, 
                  high-quality smart home products to everyone. We believe that 
                  transforming your living space shouldn't require a fortune or 
                  technical expertise.
                </p>
                <p className="velora-body text-muted-foreground mb-8">
                  Every product in our collection is carefully selected for its 
                  design, functionality, and value. From ambient lighting that 
                  creates the perfect mood to smart gadgets that simplify your 
                  daily routine, we're here to help you build the home of your dreams.
                </p>
                <Button asChild>
                  <Link to="/shop">Explore Our Products</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-6xl font-bold mb-2">10K+</p>
                    <p className="text-muted-foreground">Happy Customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="velora-section">
          <div className="velora-container">
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Why Choose Us
              </p>
              <h2 className="velora-heading-md">Our Core Values</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="velora-section bg-primary text-primary-foreground">
          <div className="velora-container text-center">
            <h2 className="velora-heading-md mb-6">Ready to Transform Your Home?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Browse our curated collection of smart home products and discover 
              what's possible. Free shipping on all orders within the USA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/shop">Shop Now</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;