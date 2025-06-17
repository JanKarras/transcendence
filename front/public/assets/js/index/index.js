async function indexInit() {
	const regForm = document.getElementById('registerForm');
	regForm.addEventListener('submit', registerNewUser);

	const loginForm = document.getElementById('loginForm');
	loginForm.addEventListener('submit', logIn);
}

async function registerNewUser(event) {
  event.preventDefault();

  const form = event.target;
  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;
  const password2 = form.password2.value;

  if (password !== password2) {
    alert('Passwords do not match!');
    return;
  }

  console.log('Registering user:', { username, email, password });
  const res = await createUser({ username, email, password });

  if (res.success) {
    console.log(`User "${username}" was successfully created.`);
    alert(`User "${username}" registered successfully.`);
  } else {
    console.error('Registration failed:', res.error);
    alert(`Registration failed: ${res.error}`);
  }
}


async function logIn(event) {
  event.preventDefault();

  const form = event.target;
  const username = form.user.value;
  const password = form.password.value;

  const credentials = { username, password };

  console.log('Attempting login for:', username);
  const res = await logInApi(credentials);

  if (res.success) {
    console.log(`User "${username}" logged in successfully.`);
    alert(`Welcome, ${username}!`);
  } else {
    console.error('Login failed:', res.error);
    alert(`Login failed: ${res.error}`);
  }
}
