async function indexInit() {
      console.log("Hello");

      // Registrierung abschicken
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
  	e.preventDefault();
  	const username = this.username.value;
  	const email = this.email.value;
  	const password = this.password.value;
  	const password2 = this.password2.value;

  	if(password !== password2) {
  	  alert('Passwörter stimmen nicht überein!');
  	  return;
  	}

  	console.log('Registrierung:', { username, email, password });
  	const res = await createUser({ username, email, password });
  	if (res.succsess) {

	} else {
		
	}
	});

      // Login abschicken
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const user = this.user.value;
        const password = this.password.value;
        console.log('Login:', { user, password });
        // Hier kannst du fetch POST zum Backend machen
      });
    }
