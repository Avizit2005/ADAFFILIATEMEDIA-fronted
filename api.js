const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const token = localStorage.getItem("adaff_token");
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  get:  (path)       => request(path),
  patch:(path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};
