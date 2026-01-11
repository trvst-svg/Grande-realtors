const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

export async function fetchAuctions() {
  const response = await fetch(`${API_BASE_URL}/api/auctions`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load auctions");
  }
  return data.items || [];
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
  const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load admin dashboard");
  }
  return data;
}

export async function fetchAgentDashboard(agentId) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/agent/${agentId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load agent dashboard");
  }
  return data;
}

export async function fetchUserDashboard(userId) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/user/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load user dashboard");
  }
  return data;
}

export async function fetchUserProfile(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unable to load profile");
  }
  return data;
}
