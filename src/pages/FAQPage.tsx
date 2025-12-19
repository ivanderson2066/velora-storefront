import { Helmet } from "react-helmet-async";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Package, Truck, RefreshCw, Shield, CreditCard, HelpCircle } from "lucide-react";

const FAQPage = () => {
  const faqCategories = [
    {
      title: "Shipping & Delivery",
      icon: Truck,
      questions: [
        {
          question: "How long does shipping take?",
          answer: "We process orders within 1-3 business days. Standard shipping to the USA takes 5-10 business days. Express shipping options are available at checkout for faster delivery (2-5 business days)."
        },
        {
          question: "Do you offer free shipping?",
          answer: "Yes! We offer free standard shipping on all orders within the United States. International shipping rates are calculated at checkout based on your location."
        },
        {
          question: "How can I track my order?",
          answer: "Once your order ships, you'll receive an email with your tracking number. You can use this number to track your package on our carrier's website. Most orders are trackable within 24-48 hours of shipping."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to most countries worldwide. International shipping times vary by location, typically 10-20 business days. Import duties and taxes may apply depending on your country."
        },
      ]
    },
    {
      title: "Orders & Products",
      icon: Package,
      questions: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our products, add items to your cart, and proceed to checkout. We accept all major credit cards and PayPal. Your order confirmation will be sent to your email immediately."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 2 hours of placing it. After this window, orders enter processing and cannot be changed. Please contact us immediately if you need to make changes."
        },
        {
          question: "Are your products safe to use?",
          answer: "Absolutely. All our products meet international safety standards and are certified for electrical safety. Each item is quality-tested before shipping to ensure it meets our high standards."
        },
        {
          question: "What voltage do your products use?",
          answer: "Most of our products are USB-powered (5V), making them compatible worldwide. For products requiring wall outlets, we include the appropriate adapter for your region upon request."
        },
      ]
    },
    {
      title: "Returns & Refunds",
      icon: RefreshCw,
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day money-back guarantee on all products. If you're not completely satisfied, return the item in its original packaging for a full refund. Return shipping is covered for defective items."
        },
        {
          question: "How do I initiate a return?",
          answer: "Contact our support team at support@myxelhome.com with your order number. We'll provide a return authorization and shipping instructions. Refunds are processed within 5-7 business days of receiving your return."
        },
        {
          question: "What if my product arrives damaged?",
          answer: "We're sorry if your item arrived damaged! Please take photos of the damage and contact us within 48 hours of delivery. We'll arrange a free replacement or full refund immediately."
        },
      ]
    },
    {
      title: "Payment & Security",
      icon: CreditCard,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, your security is our priority. We use industry-standard SSL encryption and never store your complete credit card information. Our payment processing is PCI-DSS compliant."
        },
      ]
    },
    {
      title: "Product Support",
      icon: HelpCircle,
      questions: [
        {
          question: "Do your products come with a warranty?",
          answer: "Yes, all products include a 1-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available for select products."
        },
        {
          question: "How do I set up my product?",
          answer: "Each product includes detailed instructions. Most items are plug-and-play! For additional help, scan the QR code in your product box or visit our support page for video tutorials."
        },
        {
          question: "My product isn't working. What should I do?",
          answer: "First, check if it's properly connected/charged. Try resetting the device by unplugging for 30 seconds. If issues persist, contact our support team—we're here to help 7 days a week."
        },
      ]
    },
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | MyxelHome</title>
        <meta 
          name="description" 
          content="Find answers to common questions about MyxelHome products, shipping, returns, and more. Get the support you need." 
        />
      </Helmet>

      <AnnouncementBar />
      <Header />

      <main className="bg-background">
        {/* Hero Section */}
        <section className="velora-section bg-secondary/30">
          <div className="velora-container">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Help Center
              </p>
              <h1 className="velora-heading-lg mb-6">
                Frequently Asked Questions
              </h1>
              <p className="velora-body text-muted-foreground">
                Find quick answers to common questions about our products, shipping, returns, and more. 
                Can't find what you're looking for? Our support team is always here to help.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="velora-section">
          <div className="velora-container max-w-4xl">
            <div className="space-y-12">
              {faqCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="velora-heading-md">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${index}-${faqIndex}`}
                        className="border border-border/50 rounded-lg px-6 data-[state=open]:bg-secondary/30"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="velora-section bg-primary text-primary-foreground">
          <div className="velora-container text-center">
            <Shield className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="velora-heading-md mb-4">Still Have Questions?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Our customer support team is available 7 days a week to help you with any questions or concerns.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-background text-foreground font-medium rounded-lg hover:bg-background/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQPage;