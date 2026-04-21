import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  acceptBidTicketAgreement,
  fetchAuction,
  fetchBidTicketAgreement,
  fetchUserProfile,
  initiateBidTicket,
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import "./bidding.css";

export default function BidTicketTermsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [user, setUser] = useState(null);
  const [agreementTexts, setAgreementTexts] = useState({ en: "", ne: "" });
  const [language, setLanguage] = useState("en");
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("gr_token"));

  useEffect(() => {
    let mounted = true;
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!hasToken || !stored.id) {
      navigate("/login");
      return undefined;
    }

    Promise.all([
      fetchAuction(id),
      fetchUserProfile(stored.id),
      fetchBidTicketAgreement(id),
    ])
      .then(([auctionData, profileData, agreementData]) => {
        if (!mounted) return;
        setAuction(auctionData);
        setUser(profileData.user);
        setAgreementTexts({
          en: agreementData.agreement_texts?.en || agreementData.agreement_text || "",
          ne: agreementData.agreement_texts?.ne || agreementData.agreement_text || "",
        });
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus({ type: "error", message: err.message || "Unable to load terms." });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [hasToken, id, navigate]);

  const fullName = useMemo(() => {
    if (!user) return "Bidder";
    return `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Bidder";
  }, [user]);

  const agreementText = agreementTexts[language] || agreementTexts.en || "";

  const handleProceed = async () => {
    setStatus({ type: "", message: "" });
    if (!accepted) {
      setStatus({
        type: "error",
        message: "You must accept the bid participation terms before continuing.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await acceptBidTicketAgreement(id, language);
      const data = await initiateBidTicket(id);
      if (data.status === "paid") {
        navigate(`/bidding/${id}?payment=success`);
        return;
      }
      if (data.payment?.payment_url) {
        window.location.href = data.payment.payment_url;
        return;
      }
      setStatus({ type: "error", message: "Unable to initiate payment." });
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
          <p>{status.message || "Loading terms and conditions..."}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="bidding-page">
      <Navbar showProfile />
      <section className="bidding-hero">
        <div className="hero-title">
          <h1>Bid Ticket Terms</h1>
          <span className="live-pill">Agreement Required</span>
        </div>
        <div className="bid-actions">
          <div className="panel">
            <h2>Legal Agreement</h2>
            <p className="muted">
              You must accept this contract before you can be redirected to Khalti.
            </p>
            <div className="contract-panel-header">
              <div className="muted">Read the bid participation terms in your preferred language.</div>
              <div className="contract-language" role="group" aria-label="Agreement language">
                <span>Language</span>
                <div className="contract-language-toggle">
                  <button
                    type="button"
                    className={language === "en" ? "is-active" : ""}
                    onClick={() => setLanguage("en")}
                    aria-pressed={language === "en"}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={language === "ne" ? "is-active" : ""}
                    onClick={() => setLanguage("ne")}
                    aria-pressed={language === "ne"}
                  >
                    Nepali
                  </button>
                </div>
              </div>
            </div>
            <pre className="agreement-text">{agreementText}</pre>
            <label className="terms-check">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                I, {fullName}, legally agree that if I win the bid, I must pay the
                full winning amount and may face legal action if I default.
              </span>
            </label>
            {status.message ? (
              <p className={`status ${status.type}`}>{status.message}</p>
            ) : null}
            <button type="button" onClick={handleProceed} disabled={submitting}>
              {submitting ? "Redirecting..." : "Agree and Continue to Khalti"}
            </button>
          </div>
          <div className="panel">
            <h2>Auction Summary</h2>
            <div className="ticket-status">
              <span>Property</span>
              <strong>
                {auction.property_type} in {auction.location}
              </strong>
            </div>
            <div className="ticket-status">
              <span>Starting Price</span>
              <strong>NPR {auction.starting_price}</strong>
            </div>
            <div className="ticket-status">
              <span>Bid Ticket Fee</span>
              <strong>NPR 1000</strong>
            </div>
            <div className="ticket-status">
              <span>Buyer</span>
              <strong>{fullName}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
