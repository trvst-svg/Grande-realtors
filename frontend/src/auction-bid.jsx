import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URL,
  fetchAuction,
  fetchAuctionBids,
  fetchBidTicket,
  fetchContract,
  fetchMyBid,
  initiateBidTicket,
  placeBid,
  submitSellerRating,
  updateBidStatus,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

function formatDateTime(value) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString();
}

export default function AuctionBidPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [ticket, setTicket] = useState({ status: "loading" });
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [bids, setBids] = useState([]);
  const [bidsStatus, setBidsStatus] = useState({ type: "", message: "" });
  const [myBid, setMyBid] = useState(null);
  const [contract, setContract] = useState(null);
  const [rating, setRating] = useState({ value: 5, review: "" });
  const [ratingStatus, setRatingStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("gr_token"));
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gr_user") || "{}")
      : {};
  const currentUserId = storedUser?.id;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const loadAuction = fetchAuction(id);
    const loadTicket = hasToken
      ? fetchBidTicket(id).catch(() => ({ status: "unpaid" }))
      : Promise.resolve({ status: "unpaid" });

    Promise.all([loadAuction, loadTicket])
      .then(([auctionData, ticketData]) => {
        if (!mounted) return;
        setAuction(auctionData);
        setTicket(ticketData);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus({ type: "error", message: err.message });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, hasToken]);

  useEffect(() => {
    if (!auction?.id || !hasToken) {
      setBids([]);
      setMyBid(null);
      return;
    }
    const ownerCheck = auction.owner_id && auction.owner_id === currentUserId;
    if (ownerCheck) {
      fetchAuctionBids(auction.id)
        .then(setBids)
        .catch((err) =>
          setBidsStatus({ type: "error", message: err.message })
        );
    } else {
      fetchMyBid(auction.id)
        .then(setMyBid)
        .catch(() => setMyBid(null));
    }
  }, [auction?.id, auction?.owner_id, currentUserId, hasToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      setStatus({ type: "success", message: "Ticket payment confirmed." });
    } else if (paymentStatus === "failed") {
      setStatus({ type: "error", message: "Payment was not completed." });
    }
  }, []);

  useEffect(() => {
    if (!myBid?.id || myBid.status !== "accepted") {
      setContract(null);
      return;
    }
    fetchContract(myBid.id)
      .then(setContract)
      .catch(() => setContract(null));
  }, [myBid]);

  const minBid = useMemo(() => {
    if (!auction) return 0;
    const current = Number(auction.current_price || auction.starting_price || 0);
    return current + 1;
  }, [auction]);

  useEffect(() => {
    if (!auction?.id) return undefined;
    const source = new EventSource(
      `${API_BASE_URL}/api/auctions/${auction.id}/stream`
    );
    source.addEventListener("bid", (event) => {
      try {
        const payload = JSON.parse(event.data);
        setAuction((prev) =>
          prev ? { ...prev, current_price: payload.current_price } : prev
        );
        const ownerCheck =
          auction?.owner_id && auction.owner_id === currentUserId;
        if (payload?.bid && ownerCheck) {
          setBids((prev) => [payload.bid, ...prev]);
        }
      } catch {
        // ignore
      }
    });
    return () => source.close();
  }, [auction?.id, auction?.owner_id, currentUserId]);

  const handlePayTicket = async () => {
    setStatus({ type: "", message: "" });
    if (!hasToken) {
      navigate("/login");
      return;
    }
    if (auction?.owner_id && auction.owner_id === currentUserId) {
      setStatus({
        type: "error",
        message: "You cannot bid on your own property.",
      });
      return;
    }
    setPaying(true);
    try {
      const data = await initiateBidTicket(id);
      if (data.status === "paid") {
        setTicket({ status: "paid", amount: data.amount });
      } else if (data.payment?.payment_url) {
        window.location.href = data.payment.payment_url;
      } else {
        setStatus({ type: "error", message: "Unable to initiate payment." });
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitBid = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!hasToken) {
      navigate("/login");
      return;
    }
    if (auction?.owner_id && auction.owner_id === currentUserId) {
      setStatus({
        type: "error",
        message: "You cannot bid on your own property.",
      });
      return;
    }

    if (ticket.status !== "paid") {
      setStatus({ type: "error", message: "Pay the ticket fee to bid." });
      return;
    }

    const value = Number(bidAmount);
    if (!Number.isFinite(value)) {
      setStatus({ type: "error", message: "Enter a valid bid amount." });
      return;
    }

    if (value < minBid) {
      setStatus({
        type: "error",
        message: `Minimum bid is ${minBid}.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = await placeBid(id, value);
      setStatus({ type: "success", message: data.message || "Bid placed." });
      setBidAmount("");
      const updatedAuction = await fetchAuction(id);
      setAuction(updatedAuction);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !auction) {
    return (
      <div className="bidding-page">
        <Navbar showProfile />
        <section className="bidding-hero">
          <p>{status.message || "Loading auction..."}</p>
        </section>
      </div>
    );
  }

  const imageUrl = auction.image ? `${API_BASE_URL}${auction.image}` : "";
  const isOwner = auction?.owner_id && auction.owner_id === currentUserId;
  const startTime = auction.start_time ? new Date(auction.start_time) : null;
  const endTime = auction.end_time ? new Date(auction.end_time) : null;
  const now = new Date();
  const hasStarted = !startTime || now >= startTime;
  const hasEnded = Boolean(endTime && now > endTime);
  const statusLabel = hasEnded
    ? "Auction Ended"
    : hasStarted
    ? "Auction Live"
    : "Auction Scheduled";
  const ticketLabel =
    ticket.status === "paid"
      ? "Paid"
      : ticket.status === "loading"
      ? "Checking..."
      : "Not Paid";

  return (
    <div className="bidding-page">
      <Navbar showProfile />

      <section className="bidding-hero">
        <div className="hero-title">
          <h1>Place Your Bid</h1>
          <span className="live-pill">{statusLabel}</span>
        </div>

        <div className="bid-detail">
          <div className="bid-media">
            {imageUrl ? <img src={imageUrl} alt={auction.location} /> : null}
          </div>
          <div className="bid-info">
            <h2>
              {auction.property_type} in {auction.location}
            </h2>
            <div className="bid-timing">
              <div>
                <span>Start Time</span>
                <strong>{formatDateTime(auction.start_time)}</strong>
              </div>
              <div>
                <span>End Time</span>
                <strong>{formatDateTime(auction.end_time)}</strong>
              </div>
            </div>
            {!hasStarted ? (
              <p className="status warning">
                Auction starts on {formatDateTime(auction.start_time)}.
              </p>
            ) : null}
            {hasEnded ? (
              <p className="status error">Auction has ended.</p>
            ) : null}
            <p className="muted">Current Highest Bid</p>
            <h3>NPR {auction.current_price}</h3>
            <div className="bid-meta">
              <span>Minimum Bid</span>
              <strong>NPR {minBid}</strong>
            </div>
            <div className="bid-meta">
              <span>Ticket Fee</span>
              <strong>NPR 1000</strong>
            </div>
            <div className="bid-meta">
              <span>Listing Type</span>
              <strong>{auction.listing_type || "N/A"}</strong>
            </div>
            <div className="bid-meta">
              <span>Purpose</span>
              <strong>{auction.listing_purpose || "N/A"}</strong>
            </div>
            {auction.property_type === "land" ? (
              <div className="bid-meta-grid">
                <div>
                  <span>Area</span>
                  <strong>{auction.details?.area ?? "N/A"}</strong>
                </div>
                <div>
                  <span>Dimensions</span>
                  <strong>{auction.details?.dimensions || "N/A"}</strong>
                </div>
                <div>
                  <span>Road Type</span>
                  <strong>{auction.details?.road_type || "N/A"}</strong>
                </div>
                <div>
                  <span>Road Access</span>
                  <strong>{auction.details?.road_access || "N/A"}</strong>
                </div>
                <div>
                  <span>Property Face</span>
                  <strong>{auction.details?.property_face || "N/A"}</strong>
                </div>
              </div>
            ) : null}
            {auction.property_type === "house" ? (
              <div className="bid-meta-grid">
                <div>
                  <span>Area</span>
                  <strong>{auction.details?.area ?? "N/A"}</strong>
                </div>
                <div>
                  <span>Floors</span>
                  <strong>{auction.details?.number_of_floors ?? "N/A"}</strong>
                </div>
                <div>
                  <span>Bedrooms</span>
                  <strong>{auction.details?.number_of_bedrooms ?? "N/A"}</strong>
                </div>
              </div>
            ) : null}
            {isOwner ? (
              <p className="status error">
                You cannot bid on your own property.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bid-actions">
        <div className="panel">
          <h2>Bid Ticket</h2>
          <p className="muted">
            Pay the ticket fee once to unlock bidding for this auction.
          </p>
          <div className="ticket-status">
            <span>Status</span>
            <strong>{ticketLabel}</strong>
          </div>
          <button
            type="button"
            onClick={handlePayTicket}
            disabled={paying || ticket.status === "paid" || isOwner || hasEnded}
          >
            {ticket.status === "paid"
              ? "Ticket Paid"
              : paying
              ? "Redirecting..."
              : isOwner
              ? "Owner Access"
              : hasEnded
              ? "Auction Ended"
              : "Pay Ticket Fee"}
          </button>
          {!hasToken ? (
            <p className="status warning">Sign in to purchase a bid ticket.</p>
          ) : null}
        </div>

        <div className="panel">
          <h2>Enter Your Bid</h2>
          <p className="muted">Bids must be at least NPR {minBid}.</p>
          <form onSubmit={handleSubmitBid}>
            <label htmlFor="bidAmount">Bid Amount (NPR)</label>
            <input
              id="bidAmount"
              type="number"
              min={minBid}
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              placeholder={`Minimum ${minBid}`}
              required
            />
            {status.message ? (
              <p className={`status ${status.type}`}>{status.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={
                submitting ||
                ticket.status !== "paid" ||
                isOwner ||
                !hasStarted ||
                hasEnded
              }
            >
              {submitting
                ? "Placing Bid..."
                : isOwner
                ? "Owner Access"
                : ticket.status !== "paid"
                ? "Pay Ticket to Bid"
                : !hasStarted
                ? "Auction Not Started"
                : hasEnded
                ? "Auction Ended"
                : "Submit Bid"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
