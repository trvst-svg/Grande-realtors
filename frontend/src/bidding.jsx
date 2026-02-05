import { useEffect, useState } from "react";
import { fetchAuctions } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

export default function BiddingPage() {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    fetchAuctions().then(setAuctions).catch(() => setAuctions([]));
  }, []);

  const hero = auctions[0];
  const rest = auctions.slice(1);

  return (
    <div className="bidding-page">
      <Navbar showProfile />

      <section className="bidding-hero">
        <div className="hero-title">
          <h1>Live Auctions</h1>
          <span className="live-pill">{auctions.length} Auctions Live</span>
        </div>

        {hero ? (
          <div className="hero-card">
            <div className="hero-media">
              {hero.image ? <img src={hero.image} alt={hero.location} /> : null}
            </div>
            <div className="hero-info">
              <h2>{hero.property_type} in {hero.location}</h2>
              <p className="meta">Current Bid</p>
              <h3>{hero.current_price}</h3>
              <div className="stats">
                <div>
                  <span>Total Bids</span>
                  <strong>23</strong>
                </div>
                <div>
                  <span>Participants</span>
                  <strong>15</strong>
                </div>
              </div>
              <div className="timer">Auction Ends In 02:45:30</div>
              <button>Place Your Bid</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="active-auctions">
        <h2>Active Auctions</h2>
        <div className="auction-grid">
          {rest.map((auction) => (
            <article key={auction.id} className="auction-card">
              <div className="auction-media">
                <span className="live-tag">Live</span>
                {auction.image ? (
                  <img src={auction.image} alt={auction.location} />
                ) : null}
              </div>
              <div className="auction-body">
                <h3>{auction.property_type}</h3>
                <p>{auction.location}</p>
                <span className="current">Current Bid</span>
                <strong>{auction.current_price}</strong>
                <button>Bid Now</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
