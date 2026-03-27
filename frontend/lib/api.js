const API_URL = 'http://localhost:5000';

export async function submitComplaint(data) {
  try {
    const res = await fetch(`${API_URL}/api/complaints/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    console.log('API response:', json);
    return json;
  } catch (error) {
    console.error('Submit error:', error);
    return { success: false, message: error.message };
  }
}

export async function getComplaints() {
  try {
    const res = await fetch(`${API_URL}/api/complaints/all`);
    return res.json();
  } catch (error) {
    return { success: false, complaints: [] };
  }
}

export async function getComplaint(id) {
  try {
    const res = await fetch(`${API_URL}/api/complaints/${id}`);
    return res.json();
  } catch (error) {
    return { success: false };
  }
}

export async function registerCitizen(data) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function loginCitizen(data) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
}