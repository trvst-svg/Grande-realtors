import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import {
  fetchMessageThread,
  fetchMessageThreads,
  sendInquiryMessage,
} from "./api.js";
import "./messages.css";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const requestedInquiryId = Number(searchParams.get("inquiry"));

  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gr_user") || "{}")
      : {};

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token || !storedUser?.id) {
      navigate("/login");
      return;
    }

    setLoadingThreads(true);
    fetchMessageThreads()
      .then((items) => {
        setThreads(items);
      })
      .catch((err) => {
        setStatus({ type: "error", message: err.message || "Unable to load messages." });
      })
      .finally(() => setLoadingThreads(false));
  }, [navigate, storedUser?.id]);

  useEffect(() => {
    if (!storedUser?.id) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const updatedThreads = await fetchMessageThreads();
        setThreads(updatedThreads);

        if (requestedInquiryId) {
          const data = await fetchMessageThread(requestedInquiryId);
          setSelectedThread(data.thread);
          setMessages(data.messages || []);
        }
      } catch {
        // Keep polling silent so transient network hiccups do not disrupt the thread.
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [requestedInquiryId, storedUser?.id]);

  useEffect(() => {
    if (!threads.length) {
      setSelectedThread(null);
      setMessages([]);
      return;
    }

    const initialThread =
      threads.find((item) => item.inquiry_id === requestedInquiryId) || threads[0];
    if (!initialThread) return;

    const nextId = initialThread.inquiry_id;
    if (requestedInquiryId !== nextId) {
      setSearchParams({ inquiry: String(nextId) }, { replace: true });
      return;
    }

    setLoadingThread(true);
    fetchMessageThread(nextId)
      .then((data) => {
        setSelectedThread(data.thread);
        setMessages(data.messages || []);
      })
      .catch((err) => {
        setStatus({ type: "error", message: err.message || "Unable to load thread." });
      })
      .finally(() => setLoadingThread(false));
  }, [threads, requestedInquiryId, setSearchParams]);

  const activePartnerLabel = useMemo(() => {
    if (!selectedThread) return "";
    if (storedUser?.id === selectedThread.user_id) {
      return `${selectedThread.agent_firstname || ""} ${selectedThread.agent_lastname || ""}`.trim();
    }
    return `${selectedThread.user_firstname || ""} ${selectedThread.user_lastname || ""}`.trim();
  }, [selectedThread, storedUser?.id]);

  const handleSelectThread = (inquiryId) => {
    setSearchParams({ inquiry: String(inquiryId) });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!selectedThread?.inquiry_id || !draft.trim()) {
      return;
    }

    setSending(true);
    setStatus({ type: "", message: "" });
    try {
      await sendInquiryMessage(selectedThread.inquiry_id, draft.trim());
      const data = await fetchMessageThread(selectedThread.inquiry_id);
      setMessages(data.messages || []);
      setDraft("");
      const updatedThreads = await fetchMessageThreads();
      setThreads(updatedThreads);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Unable to send message." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <Navbar showProfile />
      <section className="messages-shell">
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h1>Messages</h1>
            <p className="messages-subtitle">
              Inquiry threads between users and sales handlers.
            </p>
          </div>
          {loadingThreads ? (
            <p className="muted">Loading threads...</p>
          ) : threads.length ? (
            <div className="thread-list">
              {threads.map((thread) => {
                const isActive = thread.inquiry_id === requestedInquiryId;
                const partnerName =
                  storedUser?.id === thread.user_id
                    ? `${thread.agent_firstname || ""} ${thread.agent_lastname || ""}`.trim() ||
                      "Assigned handler"
                    : `${thread.user_firstname || ""} ${thread.user_lastname || ""}`.trim();

                return (
                  <button
                    key={thread.inquiry_id}
                    type="button"
                    className={`thread-card${isActive ? " is-active" : ""}`}
                    onClick={() => handleSelectThread(thread.inquiry_id)}
                  >
                    <div className="thread-card-top">
                      <strong>{partnerName}</strong>
                      <small>{formatDateTime(thread.latest_created_at)}</small>
                    </div>
                    <span className="thread-card-property">
                      {thread.property_type} in {thread.location}
                    </span>
                    <p className="thread-card-preview">{thread.latest_message}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="muted">No message threads yet.</p>
          )}
        </aside>

        <section className="messages-thread">
          {status.message ? (
            <p className={`status ${status.type}`}>{status.message}</p>
          ) : null}

          {loadingThread ? (
            <p className="muted">Loading thread...</p>
          ) : selectedThread ? (
            <>
              <div className="thread-header">
                <div className="thread-header-copy">
                  <h2>{activePartnerLabel || "Inquiry Thread"}</h2>
                  <p>
                    {selectedThread.property_type} in {selectedThread.location}
                  </p>
                </div>
                <Link className="mini-action secondary" to={`/properties/${selectedThread.property_id}`}>
                  View Property
                </Link>
              </div>

              <div className="message-log">
                {messages.map((item) => {
                  const isMine = item.sender_id === storedUser?.id;
                  const senderName = `${item.sender_firstname || ""} ${item.sender_lastname || ""}`.trim();
                  return (
                    <article
                      key={item.id}
                      className={`message-bubble${isMine ? " is-mine" : ""}`}
                    >
                      <header>
                        <strong>{isMine ? "You" : senderName || "Participant"}</strong>
                        <span>{formatDateTime(item.created_at)}</span>
                      </header>
                      <p>{item.message}</p>
                    </article>
                  );
                })}
              </div>

              <form className="message-compose" onSubmit={handleSend}>
                <div className="message-compose-bar">
                  <textarea
                    rows="1"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="iMessage-style reply..."
                  />
                  <button type="submit" disabled={sending || !draft.trim()}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="thread-empty">
              <h2>No thread selected</h2>
              <p>Choose an inquiry from the left to open the conversation.</p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
