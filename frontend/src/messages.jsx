import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import {
  fetchMessageThread,
  fetchMessageThreads,
  sendMessage,
} from "./api.js";
import "./messages.css";

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("gr_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("gr_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetchMessageThreads()
      .then((items) => {
        setThreads(items);
        const propertyId = searchParams.get("property");
        const participantId = searchParams.get("participant");
        if (propertyId && participantId) {
          const match = items.find(
            (thread) =>
              String(thread.property_id) === String(propertyId) &&
              String(thread.other_user_id) === String(participantId)
          );
          if (match) {
            setActiveThread(match);
            return;
          }
        }
        if (items.length) {
          setActiveThread(items[0]);
        }
      })
      .catch((err) => {
        setStatus({ type: "error", message: err.message });
      })
      .finally(() => setLoading(false));
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!activeThread?.property_id || !activeThread?.other_user_id) {
      setMessages([]);
      return;
    }

    fetchMessageThread(activeThread.property_id, activeThread.other_user_id)
      .then((data) => {
        setMessages(data.items || []);
      })
      .catch((err) => {
        setStatus({ type: "error", message: err.message });
      });
  }, [activeThread]);

  const handleSelect = (thread) => {
    setActiveThread(thread);
    setSearchParams({
      property: thread.property_id,
      participant: thread.other_user_id,
    });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeThread) return;
    setStatus({ type: "", message: "" });
    try {
      await sendMessage({
        property_id: activeThread.property_id,
        receiver_id: activeThread.other_user_id,
        body: draft.trim(),
      });
      setDraft("");
      const data = await fetchMessageThread(
        activeThread.property_id,
        activeThread.other_user_id
      );
      setMessages(data.items || []);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="messages-page">
      <Navbar showProfile />
      <div className="messages-layout">
        <aside className="threads-panel">
          <h2>Messages</h2>
          {loading ? <p className="muted">Loading...</p> : null}
          {!loading && !threads.length ? (
            <p className="muted">No conversations yet.</p>
          ) : (
            <div className="thread-list">
              {threads.map((thread) => {
                const isActive = activeThread?.id === thread.id;
                return (
                  <button
                    key={`${thread.property_id}-${thread.other_user_id}`}
                    type="button"
                    className={`thread-item${isActive ? " active" : ""}`}
                    onClick={() => handleSelect(thread)}
                  >
                    <div>
                      <strong>
                        {thread.other_user_id === storedUser.id
                          ? "You"
                          : `${thread.firstname} ${thread.lastname}`}
                      </strong>
                      <span>
                        {thread.property_type} • {thread.location}
                      </span>
                    </div>
                    <p className="snippet">{thread.body}</p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="conversation-panel">
          {activeThread ? (
            <>
              <div className="conversation-header">
                <div>
                  <h3>
                    {activeThread.property_type} • {activeThread.location}
                  </h3>
                  <p>
                    Chat with {activeThread.firstname} {activeThread.lastname}
                  </p>
                </div>
              </div>

              <div className="conversation-body">
                {messages.length ? (
                  messages.map((message) => {
                    const isMine = message.sender_id === storedUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`message-bubble${isMine ? " mine" : ""}`}
                      >
                        <p>{message.body}</p>
                        <span>
                          {message.firstname} {message.lastname}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="muted">No messages yet.</p>
                )}
              </div>

              <form className="conversation-form" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button type="submit" disabled={!draft.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="conversation-empty">
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
          {status.message ? (
            <p className={`status ${status.type}`}>{status.message}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
