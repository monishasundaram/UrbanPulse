const API_URL = 'http://localhost:5000';

export async function submitComplaint(data) {
  const res = await fetch(`http://localhost:5000/api/complaints/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  console.log('API response:', json);
  return json;
}

// Get all complaints
export async function getComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/all`);
  return res.json();
}

// Get single complaint
export async function getComplaint(id) {
  const res = await fetch(`${API_URL}/api/complaints/${id}`);
  return res.json();
}

// Register citizen
export async function registerCitizen(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Login citizen
export async function loginCitizen(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}