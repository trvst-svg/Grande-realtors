import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import {
  deletePropertyListing,
  fetchMessageThreads,
  fetchTransactionContract,
  fetchUserDashboard,
  submitRating,
} from "./api.js";
import "./dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingForm, setRatingForm] = useState({ stars: 5, review: "" });
  const [ratingStatus, setRatingStatus] = useState({ type: "", message: "" });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [contractModal, setContractModal] = useState(null);
  const [contractStatus, setContractStatus] = useState({ type: "", message: "" });
  const [messageThreads, setMessageThreads] = useState([]);
  const [messagesStatus, setMessagesStatus] = useState({ type: "", message: "" });

  const loadDashboard = async (userId) => {
    const dashboard = await fetchUserDashboard(userId);
    setData(dashboard);
  };

  const loadMessageThreads = async () => {
    try {
      const threads = await fetchMessageThreads();
      setMessageThreads(threads);
      setMessagesStatus({ type: "", message: "" });
    } catch (err) {
      setMessageThreads([]);
      setMessagesStatus({
        type: "error",
        message: err?.message || "Unable to load messages.",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!token || !stored.id) {
      navigate("/login");
      return;
    }

    loadDashboard(stored.id)
      .catch((err) => {
        const message = err?.message || "Unable to load user dashboard.";
        if (
          message.toLowerCase().includes("authorization") ||
          message.toLowerCase().includes("forbidden")
        ) {
          localStorage.removeItem("gr_token");
          localStorage.removeItem("gr_user");
          localStorage.removeItem("gr_refresh_token");
          navigate("/login");
          return;
        }
        setError(message);
        setData(null);
      });
    loadMessageThreads();
  }, [navigate]);

  const handleDeleteProperty = async (propertyId) => {
    const stored = JSON.parse(localStorage.getItem("gr_user") || "{}");
    if (!stored.id) return;
    if (!window.confirm("Delete this listing? This action cannot be undone.")) {
      return;
    }
    setActionStatus({ type: "", message: "" });
    setDeletingId(propertyId);
    try {
      await deletePropertyListing(propertyId);
      await loadDashboard(stored.id);
      setActionStatus({ type: "success", message: "Listing deleted." });
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const openRatingModal = (transaction, roleType) => {
    setRatingModal({ transaction, roleType });
    setRatingForm({ stars: 5, review: "" });
    setRatingStatus({ type: "", message: "" });
  };

  const closeRatingModal = () => {
    setRatingModal(null);
    setRatingForm({ stars: 5, review: "" });
    setRatingStatus({ type: "", message: "" });
  };

  const openContractModal = async (transaction) => {
    setContractStatus({ type: "", message: "" });
    // Reuse one modal for both buyer-side transactions and seller-owned sales.
    setContractModal({
      transaction,
      contract: null,
      language: "en",
      loading: true,
    });
    try {
      const contract = await fetchTransactionContract(transaction.transaction_id);
      setContractModal({
        transaction,
        contract,
        language: "en",
        loading: false,
      });
    } catch (err) {
      setContractModal(null);
      setContractStatus({ type: "error", message: err.message });
    }
  };

  const closeContractModal = () => {
    setContractModal(null);
    setContractStatus({ type: "", message: "" });
  };

  const handleSubmitRating = async () => {
    if (!ratingModal) return;
    setRatingStatus({ type: "", message: "" });
    setSubmittingRating(true);
    try {
      await submitRating({
        transaction_id: ratingModal.transaction.transaction_id,
        role_type: ratingModal.roleType,
        stars: ratingForm.stars,
        review: ratingForm.review,
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              completedTransactions: prev.completedTransactions.map((item) =>
                item.transaction_id === ratingModal.transaction.transaction_id
                  ? {
                      ...item,
                      seller_rated:
                        ratingModal.roleType === "seller" ? true : item.seller_rated,
                      handler_rated:
                        ratingModal.roleType === "handler" ? true : item.handler_rated,
                    }
                  : item
              ),
            }
          : prev
      );
      setRatingStatus({ type: "success", message: "Rating submitted." });
      setTimeout(() => closeRatingModal(), 700);
    } catch (err) {
      setRatingStatus({ type: "error", message: err.message });
    } finally {
      setSubmittingRating(false);
    }
  };

  if (!data) {
    return (
      <div className="dashboard-loading">
        <p>{error || "Loading user dashboard..."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar showProfile />

      <section className="dashboard-hero">
        <h1>My Dashboard</h1>
        <p>Your properties, favorites, and active bids.</p>
        <Link className="dashboard-action" to="/list-property">
          List a Property
        </Link>
      </section>

      <section className="dashboard-cards">
        <div className="dash-card">
          <span>My Properties</span>
          <strong>{data.stats.owned}</strong>
        </div>
        <div className="dash-card">
          <span>My Auctions</span>
          <strong>{data.stats.myAuctions ?? 0}</strong>
        </div>
        <div className="dash-card">
          <span>Favorites</span>
          <strong>{data.stats.favorites}</strong>
        </div>
        <div className="dash-card">
          <span>Active Bids</span>
          <strong>{data.stats.activeBids}</strong>
        </div>
        <div className="dash-card">
          <span>Messages</span>
          <strong>{messageThreads.length}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>My Properties</h2>
          {actionStatus.message ? (
            <p className={`status ${actionStatus.type}`}>{actionStatus.message}</p>
          ) : null}
          {data.myProperties.length ? (
            data.myProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                  {property.auction_id ? (
                    <span className="badge">Auction Listed</span>
                  ) : null}
                </div>
                <div className="panel-actions">
                  <span className="muted">NPR {property.price}</span>
                  <Link
                    className="mini-action secondary"
                    to={`/properties/${property.id}/edit`}
                  >
                    Edit
                  </Link>
                  {!property.auction_id ? (
                    <Link
                      className="mini-action"
                      to={`/auctions/new/${property.id}`}
                    >
                      List for Auction
                    </Link>
                  ) : null}
                  {property.transaction_id ? (
                    <button
                      type="button"
                      className="mini-action secondary"
                      onClick={() =>
                        openContractModal({
                          transaction_id: property.transaction_id,
                          property_type: property.property_type,
                          location: property.location,
                        })
                      }
                    >
                      View Contract
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="mini-action danger"
                    onClick={() => handleDeleteProperty(property.id)}
                    disabled={deletingId === property.id}
                  >
                    {deletingId === property.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No properties yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>My Auctions</h2>
          {data.myAuctions?.length ? (
            data.myAuctions.map((auction) => (
              <div key={auction.id} className="panel-row">
                <div>
                  <strong>{auction.property_type}</strong>
                  <span>{auction.location}</span>
                  <span className={`badge ${auction.status || "open"}`}>
                    {auction.status || "open"}
                  </span>
                </div>
                <div className="panel-actions">
                  <span className="muted">
                    Current: NPR {auction.current_price}
                  </span>
                  <Link
                    className="mini-action"
                    to={`/bidding/${auction.id}`}
                  >
                    View Auction
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No auctions listed yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Completed Transactions</h2>
          {contractStatus.message ? (
            <p className={`status ${contractStatus.type}`}>{contractStatus.message}</p>
          ) : null}
          {data.completedTransactions?.length ? (
            data.completedTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="panel-row transaction-row">
                <div>
                  <strong>{transaction.property_type} in {transaction.location}</strong>
                  <span>
                    Paid NPR {transaction.amount} on{" "}
                    {transaction.transaction_date
                      ? new Date(transaction.transaction_date).toLocaleDateString()
                      : "-"}
                  </span>
                  <span>
                    Seller: {transaction.seller_firstname} {transaction.seller_lastname}
                  </span>
                  {transaction.handler_id ? (
                    <span>
                      Handler: {transaction.handler_firstname} {transaction.handler_lastname}
                    </span>
                  ) : null}
                </div>
                <div className="panel-actions transaction-actions">
                  <button
                    type="button"
                    className="mini-action secondary"
                    onClick={() => openContractModal(transaction)}
                  >
                    View Contract
                  </button>
                  {!transaction.seller_rated ? (
                    <button
                      type="button"
                      className="mini-action"
                      onClick={() => openRatingModal(transaction, "seller")}
                    >
                      Rate Seller
                    </button>
                  ) : (
                    <span className="badge">Seller rated</span>
                  )}
                  {transaction.handler_id ? (
                    !transaction.handler_rated ? (
                      <button
                        type="button"
                        className="mini-action secondary"
                        onClick={() => openRatingModal(transaction, "handler")}
                      >
                        Rate Handler
                      </button>
                    ) : (
                      <span className="badge open">Handler rated</span>
                    )
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No completed transactions yet.</p>
          )}
        </div>

        <div className="panel">
          <div className="panel-actions">
            <div>
              <h2>Messages</h2>
              <p className="muted">Replies from sales handlers on your inquiries.</p>
            </div>
            <Link className="mini-action secondary" to="/messages">
              Open Inbox
            </Link>
          </div>
          {messagesStatus.message ? (
            <p className={`status ${messagesStatus.type}`}>{messagesStatus.message}</p>
          ) : messageThreads.length ? (
            messageThreads.slice(0, 5).map((thread) => {
              const handlerName =
                `${thread.agent_firstname || ""} ${thread.agent_lastname || ""}`.trim() ||
                "Assigned handler";
              return (
                <div key={thread.inquiry_id} className="panel-row">
                  <div>
                    <strong>{handlerName}</strong>
                    <span>
                      {thread.property_type} in {thread.location}
                    </span>
                    <span>{thread.latest_message}</span>
                  </div>
                  <div className="panel-actions">
                    <span className="muted">
                      {thread.latest_created_at
                        ? new Date(thread.latest_created_at).toLocaleDateString()
                        : ""}
                    </span>
                    <Link
                      className="mini-action"
                      to={`/messages?inquiry=${thread.inquiry_id}`}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted">No inquiry replies yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Bookmarked Properties</h2>
          {data.favoriteProperties?.length ? (
            data.favoriteProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                  <span className={`badge ${property.sale_status || "available"}`}>
                    {property.sale_status || "available"}
                  </span>
                </div>
                <div className="panel-actions">
                  <span className="muted">NPR {property.price}</span>
                  <Link className="mini-action" to={`/properties/${property.id}`}>
                    View Property
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No bookmarked properties yet.</p>
          )}
        </div>

        <div className="panel">
          <h2>Listings For You</h2>
          {data.listedProperties.length ? (
            data.listedProperties.map((property) => (
              <div key={property.id} className="panel-row">
                <div>
                  <strong>{property.property_type}</strong>
                  <span>{property.location}</span>
                </div>
                <div className="panel-actions">
                  <span className="muted">NPR {property.price}</span>
                  <Link className="mini-action" to={`/properties/${property.id}`}>
                    View Property
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No active listings.</p>
          )}
        </div>
      </section>

      {ratingModal ? (
        <div className="rating-modal-backdrop">
          <div className="rating-modal">
            <h3>
              Rate {ratingModal.roleType === "seller" ? "Seller" : "Handler"}
            </h3>
            <p className="muted">
              {ratingModal.transaction.property_type} in {ratingModal.transaction.location}
            </p>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= ratingForm.stars ? "active" : ""}
                  onClick={() =>
                    setRatingForm((prev) => ({ ...prev, stars: star }))
                  }
                >
                  ★
                </button>
              ))}
            </div>
            <label htmlFor="rating-review">Review</label>
            <textarea
              id="rating-review"
              rows="4"
              value={ratingForm.review}
              onChange={(event) =>
                setRatingForm((prev) => ({ ...prev, review: event.target.value }))
              }
              placeholder="Share your experience."
            />
            {ratingStatus.message ? (
              <p className={`status ${ratingStatus.type}`}>{ratingStatus.message}</p>
            ) : null}
            <div className="rating-modal-actions">
              <button type="button" className="mini-action danger" onClick={closeRatingModal}>
                Cancel
              </button>
              <button
                type="button"
                className="mini-action"
                onClick={handleSubmitRating}
                disabled={submittingRating}
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {contractModal ? (
        <div className="rating-modal-backdrop">
          <div className="rating-modal">
            <h3>Transaction Contract</h3>
            <p className="muted">
              {contractModal.transaction.property_type} in {contractModal.transaction.location}
            </p>
            {contractModal.loading ? (
              <p className="muted">Loading contract...</p>
            ) : (
              <>
                <div className="panel-actions transaction-actions">
                  <button
                    type="button"
                    className={`mini-action${
                      contractModal.language === "en" ? "" : " secondary"
                    }`}
                    onClick={() =>
                      setContractModal((prev) =>
                        prev ? { ...prev, language: "en" } : prev
                      )
                    }
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`mini-action${
                      contractModal.language === "ne" ? "" : " secondary"
                    }`}
                    onClick={() =>
                      setContractModal((prev) =>
                        prev ? { ...prev, language: "ne" } : prev
                      )
                    }
                  >
                    Nepali
                  </button>
                </div>
                <pre className="agreement-text">
                  {contractModal.contract?.contract_texts?.[contractModal.language] ||
                    contractModal.contract?.contract_text ||
                    "Contract unavailable."}
                </pre>
              </>
            )}
            <div className="rating-modal-actions">
              <button type="button" className="mini-action danger" onClick={closeContractModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
