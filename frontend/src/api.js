const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
