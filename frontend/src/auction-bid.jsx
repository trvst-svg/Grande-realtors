import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URL,
  fetchAuction,
  fetchBidTicket,
  initiateBidTicket,
  placeBid,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

function submitEsewaForm(payment) {
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
}

export default function AuctionBidPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [ticket, setTicket] = useState({ status: "loading" });
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gr_user") || "{}")
      : {};
  const currentUserId = storedUser?.id;

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;
    setLoading(true);
    Promise.all([fetchAuction(id), fetchBidTicket(id)])
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
  }, [id, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      setStatus({ type: "success", message: "Ticket payment confirmed." });
    } else if (paymentStatus === "failed") {
      setStatus({ type: "error", message: "Payment was not completed." });
    }
  }, []);

  const minBid = useMemo(() => {
    if (!auction) return 0;
    const current = Number(auction.current_price || auction.starting_price || 0);
    return current + 1;
  }, [auction]);

  const handlePayTicket = async () => {
    setStatus({ type: "", message: "" });
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
      } else if (data.payment?.gatewayUrl) {
        submitEsewaForm(data.payment);
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
          <span className="live-pill">Auction Live</span>
        </div>

        <div className="bid-detail">
          <div className="bid-media">
            {imageUrl ? <img src={imageUrl} alt={auction.location} /> : null}
          </div>
          <div className="bid-info">
            <h2>
              {auction.property_type} in {auction.location}
            </h2>
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
            disabled={paying || ticket.status === "paid" || isOwner}
          >
            {ticket.status === "paid"
              ? "Ticket Paid"
              : paying
              ? "Redirecting..."
              : isOwner
              ? "Owner Access"
              : "Pay Ticket Fee"}
          </button>
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
              disabled={submitting || ticket.status !== "paid" || isOwner}
            >
              {submitting
                ? "Placing Bid..."
                : isOwner
                ? "Owner Access"
                : ticket.status !== "paid"
                ? "Pay Ticket to Bid"
                : "Submit Bid"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
