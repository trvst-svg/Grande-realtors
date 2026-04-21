import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, fetchAuctions, updateAuctionStatus } from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

export default function BiddingPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [actionError, setActionError] = useState("");
  const [endingAuctionId, setEndingAuctionId] = useState(null);
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gr_user") || "{}")
      : {};
  const currentUserId = storedUser?.id;
  const currentUserRole = storedUser?.role;

  useEffect(() => {
    fetchAuctions().then(setAuctions).catch(() => setAuctions([]));
  }, []);

  const handleBidNow = async (auctionId) => {
    setActionError("");
    const target = auctions.find((item) => item.id === auctionId);
    if (target?.owner_id && target.owner_id === currentUserId) {
      setActionError("You cannot bid on your own property.");
      return;
    }
    navigate(`/bidding/${auctionId}`);
  };

  const now = new Date();

  const getAuctionStatusText = (auction) => {
    if (!auction) return "";
    if (auction.status === "closed") return "Ended";
    const startTime = auction.start_time ? new Date(auction.start_time) : null;
    const endTime = auction.end_time ? new Date(auction.end_time) : null;
    if (endTime && now > endTime) return "Ended";
    if (startTime && now < startTime) {
      return `Starts ${startTime.toLocaleString()}`;
    }
    return "Live";
  };

  const canViewAuction = (auction) => {
    if (!auction) return false;
    if (auction.status === "closed") {
      if (auction.owner_id && auction.owner_id === currentUserId) return true;
      return currentUserRole === "admin" || currentUserRole === "agent";
    }
    const endTime = auction.end_time ? new Date(auction.end_time) : null;
    const hasEnded = Boolean(endTime && now > endTime);
    if (!hasEnded) return true;
    if (auction.owner_id && auction.owner_id === currentUserId) return true;
    return currentUserRole === "admin" || currentUserRole === "agent";
  };

  const visibleAuctions = auctions.filter(canViewAuction);
  const hero = visibleAuctions[0];
  const rest = visibleAuctions.slice(1);
  const heroImage = hero?.image ? `${API_BASE_URL}${hero.image}` : "";
  const heroIsOwner = hero?.owner_id && hero.owner_id === currentUserId;
  const isAdmin = currentUserRole === "admin";

  const handleEndAuction = async (auctionId) => {
    setActionError("");
    setEndingAuctionId(auctionId);
    try {
      const data = await updateAuctionStatus(auctionId, "closed");
      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: data.auction?.status || "closed" }
            : auction
        )
      );
    } catch (err) {
      setActionError(err.message || "Unable to end auction.");
    } finally {
      setEndingAuctionId(null);
    }
  };

  return (
    <div className="bidding-page">
      <Navbar showProfile />

      <section className="bidding-hero">
        <div className="hero-title">
          <h1>Live Auctions</h1>
          <span className="live-pill">{visibleAuctions.length} Auctions Live</span>
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
              <div className="timer">{getAuctionStatusText(hero)}</div>
              {actionError ? <p className="status error">{actionError}</p> : null}
              <button
                type="button"
                onClick={() => handleBidNow(hero.id)}
                disabled={heroIsOwner}
              >
                {heroIsOwner ? "Your Listing" : "View Bid Details"}
              </button>
              {isAdmin && hero.status !== "closed" ? (
                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => handleEndAuction(hero.id)}
                  disabled={endingAuctionId === hero.id}
                >
                  {endingAuctionId === hero.id ? "Ending..." : "End Auction"}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="hero-card">
            <div className="hero-info">
              <h2>No live auctions right now</h2>
              <p className="meta">Ended auctions are hidden for regular users.</p>
            </div>
          </div>
        )}
      </section>

      <section className="active-auctions">
        <h2>Active Auctions</h2>
        <div className="auction-grid">
          {rest.map((auction) => {
            const imageUrl = auction.image ? `${API_BASE_URL}${auction.image}` : "";
            const isOwner = auction.owner_id && auction.owner_id === currentUserId;
            const statusText = getAuctionStatusText(auction);
            return (
            <article key={auction.id} className="auction-card">
              <div className="auction-media">
                <span className="live-tag">{statusText}</span>
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
                  disabled={isOwner}
                >
                  {isOwner ? "Your Listing" : "Bid Details"}
                </button>
                {isAdmin && auction.status !== "closed" ? (
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleEndAuction(auction.id)}
                    disabled={endingAuctionId === auction.id}
                  >
                    {endingAuctionId === auction.id ? "Ending..." : "End Auction"}
                  </button>
                ) : null}
              </div>
            </article>
          )})}
        </div>
      </section>
    </div>
  );
}
