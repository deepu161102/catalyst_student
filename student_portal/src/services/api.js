const BASE_URL = '/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// Students
export const studentService = {
  getAll: () =>
    fetch(`${BASE_URL}/students`).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/students/${id}`).then(handleResponse),

  create: (payload) =>
    fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  update: (id, payload) =>
    fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  remove: (id) =>
    fetch(`${BASE_URL}/students/${id}`, { method: 'DELETE' }).then(handleResponse),
};
