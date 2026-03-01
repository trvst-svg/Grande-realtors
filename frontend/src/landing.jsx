import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { fetchLandingData } from "./api.js";
import "./landing.css";

export default function LandingPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchLandingData()
      .then((payload) => {
        if (mounted) {
          setData(payload);
        }
      })
      .catch(() => {
        if (mounted) {
          setData({
            brand: "Grande.",
            nav: ["Home", "Lands", "Houses", "Bidding", "Contact"],
            hero: {
              label: "WELCOME TO GRANDE REALTORS",
              title: "Find Your Dream Property in Nepal",
              copy:
                "Discover prime lands, modern homes, and transparent auctions tailored to your journey to finding the perfect space with Grande Realtors.",
              cta: "Explore Properties",
            },
            benefits: {
              label: "WHY CHOOSE US",
              title: "Your Trusted Real Estate Partner",
              items: [
                {
                  title: "Expert Guidance",
                  copy: "Our experienced agents guide you through every step.",
                },
                {
                  title: "Verified Properties",
                  copy: "Every listing is screened for authenticity and quality.",
                },
                {
                  title: "Transparent Process",
                  copy: "Clear pricing and fair bids for complete confidence.",
                },
                {
                  title: "Fast Transactions",
                  copy: "Close deals quickly with our streamlined process.",
                },
                {
                  title: "Premium Listings",
                  copy: "Access exclusive homes and land opportunities.",
                },
                {
                  title: "Dedicated Support",
                  copy: "Our team stays with you before and after the sale.",
                },
              ],
            },
            featured: {
              label: "FEATURED",
              title: "Discover Premium Properties",
              items: [
                {
                  id: 1,
                  title: "Modern Villa in Budhanilkantha",
                  price: "NPR 2.5 Cr",
                  meta: "4 Beds • 3 Baths • 6,200 sq.ft",
                  badge: "New",
                },
                {
                  id: 2,
                  title: "Luxury Apartment in Lazimpat",
                  price: "NPR 1.8 Cr",
                  meta: "3 Beds • 2 Baths • 2,100 sq.ft",
                  badge: "Popular",
                },
                {
                  id: 3,
                  title: "Countryside Bungalow in Bhaktapur",
                  price: "NPR 3.2 Cr",
                  meta: "5 Beds • 4 Baths • 7,500 sq.ft",
                  badge: "Featured",
                },
              ],
            },
            cta: {
              title: "Ready to Find Your Dream Home?",
              copy:
                "Join thousands of satisfied clients who found the perfect property with Grande Realtors.",
              button: "Get Started",
            },
            footer: {
              about:
                "Grande Realtors is Nepal's premier platform for transparent real estate and verified listings.",
              quickLinks: ["Home", "About", "Services", "Blog", "Contact"],
              categories: ["Houses", "Apartments", "Lands", "Auctions"],
              contact: [
                "Kathmandu, Nepal",
                "+977 9812345678",
                "info@granderealtors.com",
              ],
            },
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="landing-loading">
        <p>Loading Grande Realtors...</p>
      </div>
    );
  }

  return (
    <div className="landing">
      <Navbar showAuthActions />

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">{data.hero.label}</span>
          <h1>
            Find Your <span>Dream</span> Property
            <br /> in Nepal
          </h1>
          <p>{data.hero.copy}</p>
          <Link className="hero-cta" to="/home">
            {data.hero.cta}
          </Link>
        </div>
        <div className="hero-card">
          <div className="hero-house">
            <div className="roof" />
            <div className="window left" />
            <div className="window right" />
            <div className="door" />
          </div>
        </div>
      </section>

      <section className="benefits">
        <span className="eyebrow">{data.benefits.label}</span>
        <h2>{data.benefits.title}</h2>
        <div className="benefit-grid">
          {data.benefits.items.map((item) => (
            <article key={item.title} className="benefit-card">
              <div className="icon" />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="featured">
        <span className="eyebrow">{data.featured.label}</span>
        <h2>{data.featured.title}</h2>
        <div className="featured-grid">
          {data.featured.items.map((item) => (
            <article key={item.id} className="property-card">
              <div className="property-media">
                <span className="badge">{item.badge}</span>
                <div className="property-house">
                  <div className="window" />
                  <div className="window" />
                </div>
              </div>
              <div className="property-body">
                <p className="price">{item.price}</p>
                <h3>{item.title}</h3>
                <p className="meta">{item.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>{data.cta.title}</h2>
        <p>{data.cta.copy}</p>
        <Link className="cta-button" to="/signup">
          {data.cta.button}
        </Link>
      </section>

      <footer className="landing-footer">
        <div>
          <h3>Grande Realtors</h3>
          <p>{data.footer.about}</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          {data.footer.quickLinks.map((item) => {
            const label = item.toLowerCase();
            const routeMap = {
              home: "/home",
              about: "/contact",
              services: "/contact",
              blog: "/contact",
              contact: "/contact",
            };
            const route = routeMap[label];
            return route ? (
              <Link key={item} to={route}>
                {item}
              </Link>
            ) : (
              <span key={item}>{item}</span>
            );
          })}
        </div>
        <div>
          <h4>Categories</h4>
          {data.footer.categories.map((item) => {
            const label = item.toLowerCase();
            const routeMap = {
              houses: "/houses",
              apartments: "/houses",
              lands: "/lands",
              auctions: "/bidding",
            };
            const route = routeMap[label];
            return route ? (
              <Link key={item} to={route}>
                {item}
              </Link>
            ) : (
              <span key={item}>{item}</span>
            );
          })}
        </div>
        <div>
          <h4>Contact</h4>
          {data.footer.contact.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
