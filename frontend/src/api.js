export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const REFRESH_TOKEN_KEY = "gr_refresh_token";

// The frontend keeps the short-lived access token and long-lived refresh token separately.
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gr_token");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setRefreshToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("gr_token");
  localStorage.removeItem("gr_user");
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function withAuthHeaders(headers = {}) {
  const token = getAuthToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

function normalizeHeaders(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) {
    // Convert Fetch's Headers object so retry logic can merge Authorization cleanly.
    return Object.fromEntries(headers.entries());
  }
  return headers;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    clearAuthStorage();
    throw new Error(data.error || "Unable to refresh session");
  }

  if (data.token) {
    localStorage.setItem("gr_token", data.token);
  }
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }
  if (data.user) {
    localStorage.setItem("gr_user", JSON.stringify(data.user));
  }

  return data;
}

async function authFetch(url, options = {}) {
  const baseHeaders = normalizeHeaders(options.headers);
  const response = await fetch(url, {
    ...options,
    headers: withAuthHeaders(baseHeaders),
    credentials: options.credentials || "include",
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    // Retry once after a silent refresh so individual screens stay simple.
    await refreshAccessToken();
  } catch {
    return response;
  }

  return fetch(url, {
    ...options,
    headers: withAuthHeaders(baseHeaders),
    credentials: options.credentials || "include",
  });
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to sign in");
  }
  return data;
}

export async function requestPasswordReset(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to request password reset");
  }
  return data;
}

export async function resetPassword(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to reset password");
  }
  return data;
}

export async function logoutUser() {
  const refreshToken = getRefreshToken();
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
  }).catch(() => {});
  clearAuthStorage();
}

export async function signupUser(formData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to create account");
  }
  return data;
}

export async function fetchHomeData() {
  const response = await fetch(`${API_BASE_URL}/api/home`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load home data");
  }
  return data;
}

export async function fetchProperties(type) {
  const endpoint = type
    ? `${API_BASE_URL}/api/properties/type/${type}`
    : `${API_BASE_URL}/api/properties`;
  const response = await fetch(endpoint);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load properties");
  }
  return data.items || [];
}

export async function fetchProperty(propertyId) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load property");
  }
  return data;
}

export async function sendPropertyInquiry(propertyId, payload) {
  const response = await authFetch(
    `${API_BASE_URL}/api/properties/${propertyId}/inquiry`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to send inquiry");
  }
  return data;
}

export async function fetchPropertyBookmarkStatus(propertyId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/properties/${propertyId}/favorite`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load bookmark status");
  }
  return data;
}

export async function addPropertyBookmark(propertyId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/properties/${propertyId}/favorite`,
    {
      method: "POST",
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to bookmark property");
  }
  return data;
}

export async function removePropertyBookmark(propertyId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/properties/${propertyId}/favorite`,
    {
      method: "DELETE",
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to remove bookmark");
  }
  return data;
}

export async function fetchAuctions() {
  const response = await fetch(`${API_BASE_URL}/api/auctions`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load auctions");
  }
  return data.items || [];
}

export async function createAuctionListing(payload) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to create auction");
  }
  return data;
}

export async function fetchAuction(auctionId) {
  const response = await fetch(`${API_BASE_URL}/api/auctions/${auctionId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load auction");
  }
  return data;
}

export async function initiateBidTicket(auctionId) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions/${auctionId}/ticket`, {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to initiate payment");
  }
  return data;
}

export async function fetchBidTicket(auctionId) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions/${auctionId}/ticket`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load ticket status");
  }
  return data;
}

export async function placeBid(auctionId, bidAmount) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions/${auctionId}/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bid_amount: bidAmount }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to place bid");
  }
  return data;
}

export async function fetchLandingData() {
  const response = await fetch(`${API_BASE_URL}/api/landing`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load landing data");
  }
  return data;
}

export async function fetchAdminDashboard() {
  const response = await authFetch(`${API_BASE_URL}/api/dashboard/admin`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load admin dashboard");
  }
  return data;
}

export async function fetchSignupRequests() {
  const response = await authFetch(`${API_BASE_URL}/api/admin/signup-requests`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load signup requests");
  }
  return data.items || [];
}

export async function fetchPropertyRequests() {
  const response = await authFetch(`${API_BASE_URL}/api/admin/property-requests`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load property requests");
  }
  return data.items || [];
}

export async function approveSignupRequest(userId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/admin/signup-requests/${userId}/approve`,
    { method: "POST" }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to approve signup");
  }
  return data;
}

export async function rejectSignupRequest(userId, reason) {
  const response = await authFetch(
    `${API_BASE_URL}/api/admin/signup-requests/${userId}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to reject signup");
  }
  return data;
}

export async function approvePropertyRequest(requestId, agentId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/admin/property-requests/${requestId}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to approve property");
  }
  return data;
}

export async function rejectPropertyRequest(requestId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/admin/property-requests/${requestId}/reject`,
    { method: "POST" }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to reject property");
  }
  return data;
}

export async function createPropertyListing(payload) {
  const response = await authFetch(`${API_BASE_URL}/api/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to submit property");
  }
  return data;
}

export async function updateProperty(propertyId, payload) {
  const response = await authFetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to update property");
  }
  return data;
}

export async function uploadPropertyImages(propertyId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const response = await authFetch(`${API_BASE_URL}/api/properties/${propertyId}/images`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to upload images");
  }
  return data;
}

export async function fetchAgentDashboard(agentId) {
  const response = await authFetch(
    `${API_BASE_URL}/api/dashboard/agent/${agentId}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load agent dashboard");
  }
  return data;
}

export async function fetchUserDashboard(userId) {
  const response = await authFetch(`${API_BASE_URL}/api/dashboard/user/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load user dashboard");
  }
  return data;
}

export async function fetchUserProfile(userId) {
  const response = await authFetch(`${API_BASE_URL}/api/users/${userId}/profile`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load profile");
  }
  return data;
}

export async function fetchSalesHandlers() {
  const response = await fetch(`${API_BASE_URL}/api/agents`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load sales handlers");
  }
  return data.items || [];
}

export async function fetchSalesHandlerProfile(agentId) {
  const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load sales handler");
  }
  return data;
}

export async function fetchMessageThreads() {
  const response = await authFetch(`${API_BASE_URL}/api/messages/threads`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load messages");
  }
  return data.items || [];
}

export async function fetchMessageThread(propertyId, participantId) {
  const params = new URLSearchParams();
  if (propertyId) params.set("property_id", propertyId);
  if (participantId) params.set("participant_id", participantId);
  const response = await authFetch(
    `${API_BASE_URL}/api/messages/thread?${params.toString()}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load conversation");
  }
  return data;
}

export async function sendMessage(payload) {
  const response = await authFetch(`${API_BASE_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to send message");
  }
  return data;
}

export async function fetchAuctionBids(auctionId) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions/${auctionId}/bids`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load bids");
  }
  return data.items || [];
}

export async function fetchMyBid(auctionId) {
  const response = await authFetch(`${API_BASE_URL}/api/auctions/${auctionId}/my-bid`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load bid");
  }
  return data.bid;
}

export async function updateBidStatus(auctionId, bidId, status) {
  const response = await authFetch(
    `${API_BASE_URL}/api/auctions/${auctionId}/bids/${bidId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to update bid");
  }
  return data;
}

export async function fetchContract(bidId) {
  const response = await authFetch(`${API_BASE_URL}/api/contracts/${bidId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load contract");
  }
  return data.contract;
}

export async function submitSellerRating(payload) {
  const response = await authFetch(`${API_BASE_URL}/api/ratings/seller`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to submit rating");
  }
  return data;
}

export async function fetchSellerRating(sellerId) {
  const response = await fetch(`${API_BASE_URL}/api/ratings/seller/${sellerId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load rating");
  }
  return data.rating;
}
