function getEmailFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('email') || '';
}

async function emailValidationInit() {

	const regForm = document.getElementById('validationForm');
	regForm.addEventListener('submit', emailValidation);
}

async function emailValidation(event) {
  event.preventDefault();

  const form = event.target;
  const code = form.code.value;

	const email = getEmailFromUrl();
  const credentials = { email, code };

  const res = await emailValidationApi(credentials);

  if (res.success) {
    console.log(`User "${username}" logged in successfully.`);
    alert(`Welcome, ${username}!`);
  } else {
    console.error('Login failed:', res.error);
    alert(`Login failed: ${res.error}`);
  }
}
