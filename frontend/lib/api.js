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
// Log an officer action
export async function logAction(data, photoFile) {
  try {
    const formData = new FormData();
    formData.append('complaint_id', data.complaint_id);
    formData.append('officer_id', data.officer_id);
    formData.append('action_type', data.action_type);
    formData.append('description', data.description);
    formData.append('status', data.status);
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    const res = await fetch(`${API_URL}/api/actions/log`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Get actions for a complaint
export async function getActions(complaintId) {
  try {
    const res = await fetch(`${API_URL}/api/actions/${complaintId}`);
    return res.json();
  } catch (error) {
    return { success: false, actions: [] };
  }
}