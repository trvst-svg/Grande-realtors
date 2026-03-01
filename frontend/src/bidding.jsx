import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, fetchAuctions, initiateBidTicket } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

export default function BiddingPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchAuctions().then(setAuctions).catch(() => setAuctions([]));
  }, []);

  const submitEsewaForm = (payment) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payment.gatewayUrl;
    form.style.display = "none";

    Object.entries(payment.fields || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleBidNow = async (auctionId) => {
    setActionError("");
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setActioningId(auctionId);
    try {
      const data = await initiateBidTicket(auctionId);
      if (data.status === "paid") {
        navigate(`/bidding/${auctionId}`);
      } else if (data.payment?.gatewayUrl) {
        submitEsewaForm(data.payment);
      } else {
        setActionError("Unable to initiate payment.");
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const hero = auctions[0];
  const rest = auctions.slice(1);
  const heroImage = hero?.image ? `${API_BASE_URL}${hero.image}` : "";

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
              {heroImage ? <img src={heroImage} alt={hero.location} /> : null}
            </div>
            <div className="hero-info">
              <h2>{hero.property_type} in {hero.location}</h2>
              <p className="meta">Current Bid</p>
              <h3>NPR {hero.current_price}</h3>
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
              {actionError ? <p className="status error">{actionError}</p> : null}
              <button
                type="button"
                onClick={() => handleBidNow(hero.id)}
                disabled={actioningId === hero.id}
              >
                {actioningId === hero.id ? "Redirecting..." : "Place Your Bid"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="active-auctions">
        <h2>Active Auctions</h2>
        <div className="auction-grid">
          {rest.map((auction) => {
            const imageUrl = auction.image ? `${API_BASE_URL}${auction.image}` : "";
            return (
            <article key={auction.id} className="auction-card">
              <div className="auction-media">
                <span className="live-tag">Live</span>
                {imageUrl ? <img src={imageUrl} alt={auction.location} /> : null}
              </div>
              <div className="auction-body">
                <h3>{auction.property_type}</h3>
                <p>{auction.location}</p>
                <span className="current">Current Bid</span>
                <strong>NPR {auction.current_price}</strong>
                <button
                  type="button"
                  onClick={() => handleBidNow(auction.id)}
                  disabled={actioningId === auction.id}
                >
                  {actioningId === auction.id ? "Redirecting..." : "Bid Now"}
                </button>
              </div>
            </article>
          )})}
        </div>
      </section>
    </div>
  );
}
