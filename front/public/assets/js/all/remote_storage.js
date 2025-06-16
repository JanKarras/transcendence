async function createUser(credentials) {
  try {
    const response = await fetch('/api/set/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Optional: genaue Fehlernachricht aus dem Backend lesen
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.message || 'Request failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
