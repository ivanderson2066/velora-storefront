import { Helmet } from "react-helmet-async";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TrustBar from "@/components/sections/TrustBar";
import FeaturedCollection from "@/components/sections/FeaturedCollection";
import BrandStory from "@/components/sections/BrandStory";
import SocialProof from "@/components/sections/SocialProof";
import FinalCTA from "@/components/sections/FinalCTA";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>MyxelHome — Innovative Smart Home Technology</title>
        <meta
          name="description"
          content="Transform your living space with innovative smart home gadgets. Levitating clocks, ambient lighting, humidifiers & more. Free shipping to USA."
        />
        <meta name="keywords" content="smart home, ambient lighting, levitating clock, home decor, humidifier, modern gadgets" />
        <link rel="canonical" href="https://myxelhome.shop" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <main>
          <HeroSection />
          <TrustBar />
          <FeaturedCollection />
          <BrandStory />
          <SocialProof />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;