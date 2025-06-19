async function logout() {
  const res = await logOutApi();

  if (res.success) {
    window.location.href = '/';
  } else {
    alert(`Logout fehlgeschlagen: ${res.error}`);
    console.error('Logout-Fehler:', res.error);
  }
}
