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
        <title>VELORA — Designed for Modern Living</title>
        <meta
          name="description"
          content="Discover thoughtfully designed essentials that blend function, comfort, and modern aesthetics. Free worldwide shipping on all orders."
        />
        <meta name="keywords" content="modern design, minimalist, lifestyle, home essentials, premium quality" />
        <link rel="canonical" href="https://velora.com" />
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
