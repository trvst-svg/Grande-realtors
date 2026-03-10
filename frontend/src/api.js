export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gr_token");
}

function withAuthHeaders(headers = {}) {
  const token = getAuthToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/inquiry`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to send inquiry");
  }
  return data;
}

export async function fetchPropertyBookmarkStatus(propertyId) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/favorite`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load bookmark status");
  }
  return data;
}

export async function addPropertyBookmark(propertyId) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/favorite`, {
    method: "POST",
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to bookmark property");
  }
  return data;
}

export async function removePropertyBookmark(propertyId) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/favorite`, {
    method: "DELETE",
    headers: withAuthHeaders(),
  });
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
  const response = await fetch(`${API_BASE_URL}/api/auctions`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
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
  const response = await fetch(`${API_BASE_URL}/api/auctions/${auctionId}/ticket`, {
    method: "POST",
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to initiate payment");
  }
  return data;
}

export async function fetchBidTicket(auctionId) {
  const response = await fetch(`${API_BASE_URL}/api/auctions/${auctionId}/ticket`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load ticket status");
  }
  return data;
}

export async function placeBid(auctionId, bidAmount) {
  const response = await fetch(`${API_BASE_URL}/api/auctions/${auctionId}/bids`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
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
  const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load admin dashboard");
  }
  return data;
}

export async function fetchSignupRequests() {
  const response = await fetch(`${API_BASE_URL}/api/admin/signup-requests`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load signup requests");
  }
  return data.items || [];
}

export async function fetchPropertyRequests() {
  const response = await fetch(`${API_BASE_URL}/api/admin/property-requests`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load property requests");
  }
  return data.items || [];
}

export async function approveSignupRequest(userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/signup-requests/${userId}/approve`,
    { method: "POST", headers: withAuthHeaders() }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to approve signup");
  }
  return data;
}

export async function rejectSignupRequest(userId, reason) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/signup-requests/${userId}/reject`,
    {
      method: "POST",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ reason }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to reject signup");
  }
  return data;
}

export async function approvePropertyRequest(requestId) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/property-requests/${requestId}/approve`,
    { method: "POST", headers: withAuthHeaders() }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to approve property");
  }
  return data;
}

export async function rejectPropertyRequest(requestId) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/property-requests/${requestId}/reject`,
    { method: "POST", headers: withAuthHeaders() }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to reject property");
  }
  return data;
}

export async function createPropertyListing(payload) {
  const response = await fetch(`${API_BASE_URL}/api/properties`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to submit property");
  }
  return data;
}

export async function updateProperty(propertyId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
    method: "PUT",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
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
  const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/images`, {
    method: "POST",
    headers: withAuthHeaders(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to upload images");
  }
  return data;
}

export async function fetchAgentDashboard(agentId) {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/agent/${agentId}`,
    { headers: withAuthHeaders() }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load agent dashboard");
  }
  return data;
}

export async function fetchUserDashboard(userId) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/user/${userId}`, {
    headers: withAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load user dashboard");
  }
  return data;
}

export async function fetchUserProfile(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
    headers: withAuthHeaders(),
  });
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
