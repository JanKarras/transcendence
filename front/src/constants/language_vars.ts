import { trans } from "./structs.js";

export const AVAILABLE_LANGUAGES = [
	{ code: "eng", label: "English", flag: "./assets/img/lang/gb-eng.webp" },
	{ code: "ger", label: "Deutsch", flag: "./assets/img/lang/de.webp" },
	{ code: "nig", label: "Nigerian", flag: "./assets/img/lang/nig.webp" },
	{ code: "fr", label: "Français", flag: "./assets/img/lang/fr.webp" },
	{ code: "ua", label: "українська", flag: "./assets/img/lang/ua.webp" },
];

export const lang = {
	playNowBtn: {
		ger: "Jetzt spielen!",
		eng: "Ready for the next match?",
		nig: "Nzube ọzọ dị njikere?",
		fr: "Prêt pour le prochain match ?",
		ua: "Готові до наступного матчу?",
	},

	readyTitle: {
		ger: "Bereit für das nächste Match?",
		eng: "Ready for the next match?",
		nig: "Nzube ọzọ dị njikere?",
		fr: "Prêt pour le prochain match ?",
		ua: "Готові до наступного матчу?",
	},
	readySubtitle: {
		ger: "Spiele online Ping Pong gegen Freunde oder im Turnier!",
		eng: "Play online Ping Pong against friends or compete in a tournament!",
		nig: "Kporie Ping Pong n'ịntanetị megide enyi ma ọ bụ sonye na asọmpi!",
		fr: "Jouez au ping-pong en ligne contre des amis ou participez à un tournoi !",
		ua: "Грайте в настільний теніс онлайн з друзями або беріть участь у турнірі!",
	},
	playTitle: {
		ger: "Spielen",
		eng: "Play",
		nig: "Kporie",
		fr: "Jouer",
		ua: "Грати",
	},
	playDesc: {
		ger: "Starte ein schnelles Spiel",
		eng: "Start a quick match",
		nig: "Malite egwuregwu ozugbo",
		fr: "Commencez une partie rapide",
		ua: "Почніть швидкий матч",
	},
	tournamentTitle: {
		ger: "Turnier",
		eng: "Tournament",
		nig: "Asọmpi",
		fr: "Tournoi",
		ua: "Турнір",
	},
	tournamentDesc: {
		ger: "Starte ein Turnier",
		eng: "Start a tournament",
		nig: "Malite asọmpi",
		fr: "Lancez un tournoi",
		ua: "Почніть турнір",
	},
	tournamentBtn: {
		ger: "Jetzt starten!",
		eng: "Start now!",
		nig: "Malite ugbu a!",
		fr: "Commencer maintenant !",
		ua: "Почати зараз!",
	},
	onlinePlayers: {
		ger: "Spieler online",
		eng: "Online Players",
		nig: "Ụmụ egwuregwu dị n'ịntanetị",
		fr: "Joueurs en ligne",
		ua: "Гравців онлайн",
	},
	activeTournaments: {
		ger: "Aktive Turniere",
		eng: "Active Tournaments",
		nig: "Asọmpi dị na-aga",
		fr: "Tournois actifs",
		ua: "Активні турніри",
	},
	matchesToday: {
		ger: "Spiele heute",
		eng: "Matches Today",
		nig: "Egwuregwu taa",
		fr: "Matchs aujourd'hui",
		ua: "Матчів сьогодні",
	},

	emailTitle: {
		ger: "E-Mail bestätigen",
		eng: "Email Validation",
		fr: "Validation d'e-mail",
		ua: "Підтвердження електронної пошти",
		nig: "Nyocha Email"
	},
	emailInstruction: {
		ger: "Bitte gib den 6-stelligen Code ein, den wir gesendet haben an",
		eng: "Please enter the 6-digit code sent to",
		fr: "Veuillez entrer le code à 6 chiffres envoyé à",
		ua: "Будь ласка, введіть 6-значний код, надісланий на",
		nig: "Biko tinye koodu 6 nke a zitere na"
	},
	emailVerifyBtn: {
		ger: "E-Mail bestätigen",
		eng: "Verify Email",
		fr: "Vérifier l'e-mail",
		ua: "Підтвердити email",
		nig: "Nyocha Email"
	},
	emailMissingWarning: {
		ger: "Bitte verwende den Link aus deiner E-Mail! Du wirst in 3 Sekunden zum Login weitergeleitet.",
		eng: "Please use the link we sent you! You will be redirected to login in 3 seconds.",
		fr: "Veuillez utiliser le lien que nous vous avons envoyé ! Redirection vers la connexion dans 3 secondes.",
		ua: "Будь ласка, скористайтесь посиланням, яке ми вам надіслали! Вас буде перенаправлено до входу через 3 секунди.",
		nig: "Biko jiri njikọ anyị zitere gị! Ị ga-agba ọsọ gaa na nbanye n'ime sekọnd 3."
	},

	loginTitle: {
		ger: "Login",
		eng: "Login",
		fr: "Connexion",
		ua: "Вхід",
		nig: "Nbanye"
	},
	loginUserField: {
		ger: "Benutzername oder E-Mail:",
		eng: "Username or Email:",
		fr: "Nom d’utilisateur ou e-mail :",
		ua: "Ім’я користувача або електронна пошта:",
		nig: "Aha njirimara ma ọ bụ Email:"
	},
	loginPasswordField: {
		ger: "Passwort:",
		eng: "Password:",
		fr: "Mot de passe :",
		ua: "Пароль:",
		nig: "Okwuntughe:"
	},
	loginBtn: {
		ger: "Einloggen",
		eng: "Login",
		fr: "Se connecter",
		ua: "Увійти",
		nig: "Banye"
	},
	loginToRegisterBtn: {
		ger: "Registrieren",
		eng: "Register",
		fr: "S’inscrire",
		ua: "Зареєструватися",
		nig: "Debanye"
	},

	dashboard: {
		ger: "Dashboard",
		eng: "Dashboard",
		fr: "Tableau de bord",
		ua: "Дашборд",
		nig: "Dashbọọdụ"
	},
	profileDbError: {
		ger: "Datenbankfehler. Du wirst ausgeloggt.",
		eng: "Database error. You will be logged out.",
		fr: "Erreur de base de données. Vous serez déconnecté.",
		ua: "Помилка бази даних. Вас буде виведено.",
		nig: "Njehie n'ọrụ nchekwa. A ga-apụ gị."
	},
	profileAgeUnknown: {
		ger: "Nicht angegeben",
		eng: "Not provided",
		fr: "Non fourni",
		ua: "Не вказано",
		nig: "Enweghị"
	},
	profileChangePhoto: {
		ger: "Ändern",
		eng: "Change",
		fr: "Changer",
		ua: "Змінити",
		nig: "Gbanwe"
	},
	profileSaveBtn: {
		ger: "Speichern",
		eng: "Save",
		fr: "Enregistrer",
		ua: "Зберегти",
		nig: "Chekwaa"
	},
	profileCancelBtn: {
		ger: "Abbrechen",
		eng: "Cancel",
		fr: "Annuler",
		ua: "Скасувати",
		nig: "Kwụsị"
	},
	profileLabel_username: {
		ger: "Benutzername",
		eng: "Username",
		fr: "Nom d’utilisateur",
		ua: "Ім'я користувача",
		nig: "Aha njirimara"
	},
	profileLabel_first_name: {
		ger: "Vorname",
		eng: "First Name",
		fr: "Prénom",
		ua: "Ім’я",
		nig: "Aha mbụ"
	},
	profileLabel_last_name: {
		ger: "Nachname",
		eng: "Last Name",
		fr: "Nom de famille",
		ua: "Прізвище",
		nig: "Aha ezinụlọ"
	},
	profileLabel_age: {
		ger: "Alter",
		eng: "Age",
		fr: "Âge",
		ua: "Вік",
		nig: "Afọ"
	},
	profileLabel_last_seen: {
		ger: "Zuletzt online",
		eng: "Last seen",
		fr: "Dernière connexion",
		ua: "Останнє відвідування",
		nig: "Hụ ikpeazụ"
	},
	registerTitle: {
		eng: "Register",
		ger: "Registrieren",
		nig: "Debanye",
		fr: "S'inscrire",
		ua: "Реєстрація",
	},
	registerUsername: {
		eng: "Username",
		ger: "Benutzername",
		nig: "Aha njirimara",
		fr: "Nom d'utilisateur",
		ua: "Ім'я користувача",
	},
	registerEmail: {
		eng: "Email",
		ger: "E-Mail",
		nig: "Imel",
		fr: "E-mail",
		ua: "Електронна пошта",
	},
	registerPassword: {
		eng: "Password",
		ger: "Passwort",
		nig: "Okwuntughe",
		fr: "Mot de passe",
		ua: "Пароль",
	},
	registerPasswordConfirm: {
		eng: "Confirm Password",
		ger: "Passwort bestätigen",
		nig: "Kwado okwuntughe",
		fr: "Confirmez le mot de passe",
		ua: "Підтвердіть пароль",
	},
	registerBtn: {
		eng: "Register",
		ger: "Registrieren",
		nig: "Debanye",
		fr: "S'inscrire",
		ua: "Зареєструватися",
	},
	backBtn: {
		eng: "Back",
		ger: "Zurück",
		nig: "Laghachi",
		fr: "Retour",
		ua: "Назад",
	},
	emailTitle2: {
		ger: "E-Mail bestätigen",
		eng: "Email Validation",
		fr: "Validation d'e-mail",
		ua: "Підтвердження електронної пошти",
		nig: "Nyocha Email"
	},
	emailInstruction2: {
		ger: "Bitte gib den 6-stelligen Code ein, den wir gesendet haben an",
		eng: "Please enter the 6-digit code sent to",
		fr: "Veuillez entrer le code à 6 chiffres envoyé à",
		ua: "Будь ласка, введіть 6-значний код, надісланий на",
		nig: "Biko tinye koodu 6 nke a zitere na"
	},
	emailVerifyBtn2: {
		ger: "E-Mail bestätigen",
		eng: "Verify Email",
		fr: "Vérifier l'e-mail",
		ua: "Підтвердити email",
		nig: "Nyocha Email"
	},
	showFriendsBtn: {
		ger: "👥 Freunde anzeigen",
		eng: "👥 Show Friends",
		fr: "👥 Voir les amis",
		ua: "👥 Показати друзів",
		nig: "👥 Gosi Ndị enyi"
	},
	noFriends: {
		ger: "Keine Freunde",
		eng: "No friends",
		fr: "Aucun ami",
		ua: "Немає друзів",
		nig: "Enweghị ndị enyi"
	},
	online: {
		ger: "Online",
		eng: "Online",
		fr: "En ligne",
		ua: "Онлайн",
		nig: "N'ịntanetị"
	},
	offline: {
		ger: "Offline",
		eng: "Offline",
		fr: "Hors ligne",
		ua: "Офлайн",
		nig: "Na-apụ n'ịntanetị"
	},
	startChat: {
		ger: "Chat starten",
		eng: "Start chat",
		fr: "Démarrer le chat",
		ua: "Почати чат",
		nig: "Bido mkparịta ụka"
	},
	startGame: {
		ger: "Spiel starten",
		eng: "Start game",
		fr: "Démarrer le jeu",
		ua: "Почати гру",
		nig: "Bido egwuregwu"
	},

	profile: {
		ger: "Profil",
		eng: "Profile",
		fr: "Profil",
		ua: "Профіль",
		nig: "Nkọwapụta onwe"
	},

	dashboard2: {
		ger: "Dashboard",
		eng: "Dashboard",
		fr: "Tableau de bord",
		ua: "Панель",
		nig: "Dashboard"
	},
	logout: {
		ger: "Abmelden",
		eng: "Logout",
		fr: "Déconnexion",
		ua: "Вийти",
		nig: "Pụọ"
	},
	languageLabel: {
		ger: "🌐 Sprache:",
		eng: "🌐 Language:",
		fr: "🌐 Langue:",
		ua: "🌐 Мова:",
		nig: "🌐 Asụsụ:"
	},

	successDefaultMessage: {
		ger: "Erfolg!",
		eng: "Success!",
		fr: "Succès !",
		ua: "Успіх!",
		nig: "Ihe gara nke ọma!"
	},
	errorDefaultMessage: {
		ger: "Ein Fehler ist aufgetreten.",
		eng: "An error occurred.",
		fr: "Une erreur s'est produite.",
		ua: "Виникла помилка.",
		nig: "Mperede mere."
	},

	loginRequired: {
		ger: "Du musst eingeloggt sein, um diese Seite zu sehen.",
		eng: "You must be logged in to access this page.",
		fr: "Vous devez être connecté pour accéder à cette page.",
		ua: "Ви повинні увійти, щоб переглянути цю сторінку.",
		nig: "Ị ga-abụ onye nbanye ka i nwee ike ịhụ ibe a."
	},

	friendsOnline: {
		ger: "Freunde Online",
		eng: "Friends Online",
		fr: "Amis en ligne",
		ua: "Друзі онлайн",
		nig: "Ụfọdụ enyi nọ n'ịntanetị"
	},
	allFriends: {
		ger: "Alle Freunde",
		eng: "All Friends",
		fr: "Tous les amis",
		ua: "Усі друзі",
		nig: "Enyi niile"
	},
	addFriends: {
		ger: "Freunde hinzufügen",
		eng: "Add Friends",
		fr: "Ajouter des amis",
		ua: "Додати друзів",
		nig: "Tinye ndị enyi"
	},
	friendRequests: {
		ger: "Anfragen",
		eng: "Requests",
		fr: "Demandes",
		ua: "Запити",
		nig: "Arịrịọ"
	},
	domLoadError: {
		ger: "Fehler beim Laden des DOM. Du wirst ausgeloggt. Bitte versuche es später erneut.",
		eng: "Error with DOM loading. You will be logged out. Please try again later.",
		fr: "Erreur lors du chargement du DOM. Vous serez déconnecté. Veuillez réessayer plus tard.",
		ua: "Помилка завантаження DOM. Вас буде виведено з системи. Будь ласка, спробуйте пізніше.",
		nig: "Njehie na mbubata DOM. A ga-ewepụ gị. Biko nwalee ọzọ."
	},
	name: {
		ger: "Name",
		eng: "Name",
		fr: "Nom",
		ua: "Ім'я",
		nig: "Aha"
	},
	age: {
		ger: "Alter",
		eng: "Age",
		fr: "Âge",
		ua: "Вік",
		nig: "Afọ"
	},
	wins: {
		ger: "Siege",
		eng: "Wins",
		fr: "Victoires",
		ua: "Перемоги",
		nig: "Mmeri"
	},
	loses: {
		ger: "Niederlagen",
		eng: "Loses",
		fr: "Défaites",
		ua: "Поразки",
		nig: "Nfu"
	},
	tournamentWins: {
		ger: "Turnier-Siege",
		eng: "Tournament Wins",
		fr: "Victoires en tournoi",
		ua: "Перемоги в турнірах",
		nig: "Mmeri asọmpi"
	},

	startMatch: {
		ger: "Match starten",
		eng: "Start Match",
		fr: "Démarrer le match",
		ua: "Почати матч",
		nig: "Malite Egwuregwu"
	},
	chatWith: {
		ger: "Chat mit",
		eng: "Chat with",
		fr: "Discuter avec",
		ua: "Чат з",
		nig: "Mkparịta ụka na"
	},
	inviteToGame: {
		ger: "Spiel-Einladung an",
		eng: "Invite to game",
		fr: "Invitation au jeu",
		ua: "Запрошення до гри",
		nig: "Nkwenye egwuregwu"
	},
	requestsLater: {
		ger: "Anfragen werden später geladen...",
		eng: "Requests will be loaded later...",
		fr: "Les demandes seront chargées plus tard...",
		ua: "Запити будуть завантажені пізніше...",
		nig: "A ga-ebudata arịrịọ mgbe e mesịrị..."
	},

	databaseError: {
		ger: "Datenbankfehler. Du wirst ausgeloggt.",
		eng: "Database Error. You will be logged out.",
		fr: "Erreur de base de données. Vous serez déconnecté.",
		ua: "Помилка бази даних. Ви будете виведені з системи.",
		nig: "Njehie nchekwa data. A ga-ewepụ gị."
	},

	invalidCode: {
		ger: "Bitte gib einen gültigen 6-stelligen Code ein.",
		eng: "Please enter a valid 6-digit code.",
		fr: "Veuillez entrer un code valide à 6 chiffres.",
		ua: "Будь ласка, введіть дійсний 6-значний код.",
		nig: "Biko tinye koodu 6 ziri ezi."
	},
	emailValidated: {
		ger: "Du hast deinen Account erfolgreich bestätigt. Du wirst in 3 Sekunden zum Login weitergeleitet.",
		eng: "You validated your account successfully. You will be redirected to login in 3 seconds.",
		fr: "Vous avez validé votre compte avec succès. Vous serez redirigé vers la connexion dans 3 secondes.",
		ua: "Ви успішно підтвердили свій акаунт. Ви будете перенаправлені до входу через 3 секунди.",
		nig: "Ị kwadoro akaụntụ gị nke ọma. A ga-ebufe gị na nbanye n'ime sekọnd 3."
	},

	loginSuccess: {
		ger: "Login erfolgreich für Benutzer {username}",
		eng: "Login successful for user {username}",
		fr: "Connexion réussie pour l'utilisateur {username}",
		ua: "Вхід успішний для користувача {username}",
		nig: "Nbanye gara nke ọma maka onye ọrụ {username}"
	},
	loginFailed: {
		ger: "Login fehlgeschlagen: {error}",
		eng: "Login failed: {error}",
		fr: "Échec de la connexion : {error}",
		ua: "Помилка входу: {error}",
		nig: "Nbanye dara ada: {error}"
	},

	passwordLength: {
		ger: "Das Passwort muss mindestens 8 Zeichen lang sein.",
		eng: "Password must be at least 8 characters long.",
		fr: "Le mot de passe doit contenir au moins 8 caractères.",
		ua: "Пароль повинен містити щонайменше 8 символів.",
		nig: "Paswọọdụ ga-adịkarị nkeji 8 ma ọ dịkarịa ala."
	},
	passwordUppercase: {
		ger: "Das Passwort muss mindestens einen Großbuchstaben enthalten.",
		eng: "Password must contain at least one uppercase letter.",
		fr: "Le mot de passe doit contenir au moins une lettre majuscule.",
		ua: "Пароль повинен містити принаймні одну велику літеру.",
		nig: "Paswọọdụ ga-enwe otu mkpụrụedemede ukwu."
	},
	passwordLowercase: {
		ger: "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.",
		eng: "Password must contain at least one lowercase letter.",
		fr: "Le mot de passe doit contenir au moins une lettre minuscule.",
		ua: "Пароль повинен містити принаймні одну маленьку літеру.",
		nig: "Paswọọdụ ga-enwe otu mkpụrụedemede obere."
	},
	passwordNumber: {
		ger: "Das Passwort muss mindestens eine Zahl enthalten.",
		eng: "Password must contain at least one number.",
		fr: "Le mot de passe doit contenir au moins un chiffre.",
		ua: "Пароль повинен містити принаймні одну цифру.",
		nig: "Paswọọdụ ga-enwe otu nọmba."
	},
	passwordSpecialChar: {
		ger: "Das Passwort muss mindestens ein Sonderzeichen enthalten.",
		eng: "Password must contain at least one special character.",
		fr: "Le mot de passe doit contenir au moins un caractère spécial.",
		ua: "Пароль повинен містити принаймні один спеціальний символ.",
		nig: "Paswọọdụ ga-enwe otu akara pụrụ iche."
	},
	passwordNoSpaces: {
		ger: "Das Passwort darf keine Leerzeichen enthalten.",
		eng: "Password cannot contain spaces.",
		fr: "Le mot de passe ne peut pas contenir d'espaces.",
		ua: "Пароль не може містити пробілів.",
		nig: "Paswọọdụ apụghị ịnwe oghere."
	},
	passwordMismatch: {
		ger: "Passwörter stimmen nicht überein!",
		eng: "Passwords do not match!",
		fr: "Les mots de passe ne correspondent pas!",
		ua: "Паролі не співпадають!",
		nig: "Paswọọdụ adịghị dakọtara!"
	},
	unknownError: {
		ger: "Unbekannter Fehler",
		eng: "Unknown error",
		fr: "Erreur inconnue",
		ua: "Невідома помилка",
		nig: "Ihe mberede amaghị"
	},
	registerSuccess: {
		ger: "Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.",
		eng: "Register was successful. Please remember to validate your email address.",
		fr: "L'inscription a réussi. Veuillez valider votre adresse e-mail.",
		ua: "Реєстрація пройшла успішно. Будь ласка, підтвердьте свою електронну адресу.",
		nig: "Enyemaka debanye aha gara nke ọma. Biko gosi email gi."
	},
	registerFailed: {
		ger: "Registrierung fehlgeschlagen: {error}",
		eng: "Registration failed: {error}",
		fr: "Échec de l'inscription : {error}",
		ua: "Помилка реєстрації: {error}",
		nig: "Ndebanye aha dara ada: {error}"
	},

	invalid6DigitCode: {
		ger: "Bitte gib einen gültigen 6-stelligen Code ein.",
		eng: "Please enter a valid 6-digit code.",
		fr: "Veuillez saisir un code valide à 6 chiffres.",
		ua: "Будь ласка, введіть дійсний 6-значний код.",
		nig: "Biko tinye koodu ziri ezi nke mkpụrụ 6."
	},
	twoFASuccess: {
		ger: "2FA war erfolgreich. Du wirst in 3 Sekunden zum Dashboard weitergeleitet.",
		eng: "2FA was successful. You will be redirected to the dashboard in 3 seconds.",
		fr: "2FA a réussi. Vous serez redirigé vers le tableau de bord dans 3 secondes.",
		ua: "2FA пройшло успішно. Вас буде перенаправлено на панель керування через 3 секунди.",
		nig: "2FA gara nke ọma. A ga-eduga gị na dashboard n’ime sekọnd atọ."
	},

	friends: {
		ger: "Freunde",
		eng: "Friends",
		fr: "Amis",
		ua: "Друзі",
		nig: "Enyi"
	},

	unfriend: {
		ger: "Freund entfernen",
		eng: "Unfriend",
		fr: "Supprimer ami",
		ua: "Видалити друга",
		nig: "Hapụ enyi",
	},
	addFriend: {
		ger: "Freund hinzufügen",
		eng: "Add Friend",
		fr: "Ajouter un ami",
		ua: "Додати друга",
		nig: "Tinye enyi",
	},
	searchFriend: {
		ger: "Freund suchen...",
		eng: "Search friend...",
		fr: "Rechercher un ami...",
		ua: "Пошук друга...",
		nig: "Chọọ enyi...",
	},
	confirmUnfriend: {
		ger: "Möchtest du {username} wirklich entfernen?",
		eng: "Do you really want to remove {username}?",
		fr: "Voulez-vous vraiment supprimer {username} ?",
		ua: "Ви дійсно хочете видалити {username}?",
		nig: "Ị chọrọ iwepu {username} n’ezie?",
	},
	friendRequestSent: {
		ger: "Freundschaftsanfrage an {username} gesendet.",
		eng: "Friend request sent to {username}.",
		fr: "Demande d'ami envoyée à {username}.",
		ua: "Запит дружби надіслано до {username}.",
		nig: "Izitere {username} arịrịọ enyi.",
	},
	friendRequestFailed: {
		ger: "Freundschaftsanfrage an {username} fehlgeschlagen.",
		eng: "Friend request to {username} failed.",
		fr: "Échec de la demande d'ami à {username}.",
		ua: "Не вдалося надіслати запит дружби до {username}.",
		nig: "Arịrịọ enyi gara na {username} emerughị emezu.",
	},
	friendRequestAccepted: {
		ger: "Freundschaftsanfrage von {username} akzeptiert.",
		eng: "Friend request from {username} accepted.",
		fr: "Demande d'ami de {username} acceptée.",
		ua: "Запит дружби від {username} прийнято.",
		nig: "Anabatara arịrịọ enyi si {username}.",
	},
	friendRequestAcceptFailed: {
		ger: "Annehmen der Freundschaftsanfrage von {username} fehlgeschlagen.",
		eng: "Failed to accept friend request from {username}.",
		fr: "Échec de l'acceptation de la demande d'ami de {username}.",
		ua: "Не вдалося прийняти запит дружби від {username}.",
		nig: "Ọ dịghị arụsi ike ịnakwere arịrịọ enyi si {username}.",
	},
	friendRequestDeclined: {
		ger: "Freundschaftsanfrage von {username} abgelehnt.",
		eng: "Friend request from {username} declined.",
		fr: "Demande d'ami de {username} refusée.",
		ua: "Запит дружби від {username} відхилено.",
		nig: "Ajụla arịrịọ enyi si {username}.",
	},
	friendRequestDeclineFailed: {
		ger: "Ablehnen der Freundschaftsanfrage von {username} fehlgeschlagen.",
		eng: "Failed to decline friend request from {username}.",
		fr: "Échec du refus de la demande d'ami de {username}.",
		ua: "Не вдалося відхилити запит дружби від {username}.",
		nig: "Ọ dịghị arụsi ike ịjụ arịrịọ enyi si {username}.",
	},
	friendRemoved: {
		ger: "{username} wurde aus deiner Freundesliste entfernt.",
		eng: "{username} has been removed from your friends list.",
		fr: "{username} a été retiré de votre liste d'amis.",
		ua: "{username} було видалено з вашого списку друзів.",
		nig: "E wepụrụ {username} n'usoro ndị enyi gị.",
	},
	friendRemoveFailed: {
		ger: "Entfernen von {username} aus deiner Freundesliste fehlgeschlagen.",
		eng: "Failed to remove {username} from your friends list.",
		fr: "Échec de la suppression de {username} de votre liste d'amis.",
		ua: "Не вдалося видалити {username} зі списку друзів.",
		nig: "Ọ dịghị arụsi ike iwepụ {username} n'usoro ndị enyi gị.",
	},
	status: {
		nothandled: {
			ger: "Anfrage ausstehend",
			eng: "Request pending",
			nig: "Arịrịọ ka na-eche",
			fr: "Demande en attente",
			ua: "Запит у очікуванні",
		},
		accepted: {
			ger: "Anfrage angenommen",
			eng: "Request accepted",
			nig: "Arịrịọ anabatara",
			fr: "Demande acceptée",
			ua: "Запит прийнято",
		},
		declined: {
			ger: "Anfrage abgelehnt",
			eng: "Request declined",
			nig: "Arịrịọ ajụrụ",
			fr: "Demande refusée",
			ua: "Запит відхилено",
		},
		unknown: {
			ger: "Status unbekannt",
			eng: "Unknown status",
			nig: "Ọnọdụ amaghị",
			fr: "Statut inconnu",
			ua: "Невідомий статус",
		}
	},
	requestBox: {
		friendRequestRecv: {
			ger: "möchte dich als Freund hinzufügen",
			eng: "wants to add you as a friend",
			nig: "chọrọ itinye gị dị ka enyi",
			fr: "veut vous ajouter comme ami",
			ua: "хоче додати вас у друзі",
		},
		gameInviteRecv: {
			ger: "lädt dich zu einem Spiel ein",
			eng: "invites you to a game",
			nig: "kpọrọ gị ka ị bịa n’egwuregwu",
			fr: "vous invite à un jeu",
			ua: "запрошує вас до гри",
		},
		friendRequestSend: {
			ger: "Du hast eine Freundschaftsanfrage gesendet",
			eng: "You sent a friend request",
			nig: "Izitere arịrịọ enyi",
			fr: "Vous avez envoyé une demande d'ami",
			ua: "Ви надіслали запит у друзі",
		},
		gameInviteSend: {
			ger: "Du hast eine Spieleinladung gesendet",
			eng: "You sent a game invite",
			nig: "Izitere ọkpọ egwuregwu",
			fr: "Vous avez envoyé une invitation à un jeu",
			ua: "Ви надіслали запрошення до гри",
		},
		accept: {
			ger: "Annehmen",
			eng: "Accept",
			nig: "Nabata",
			fr: "Accepter",
			ua: "Прийняти",
		},
		decline: {
			ger: "Ablehnen",
			eng: "Decline",
			nig: "Jụ",
			fr: "Refuser",
			ua: "Відхилити",
		},
		status: {
			nothandled: {
				ger: "Ausstehend",
				eng: "Pending",
				nig: "Na-eche",
				fr: "En attente",
				ua: "В очікуванні",
			},
			accepted: {
				ger: "Angenommen",
				eng: "Accepted",
				nig: "Anabatara",
				fr: "Accepté",
				ua: "Прийнято",
			},
			declined: {
				ger: "Abgelehnt",
				eng: "Declined",
				nig: "Ajụrụ",
				fr: "Refusé",
				ua: "Відхилено",
			},
			unknown: {
				ger: "Unbekannt",
				eng: "Unknown",
				nig: "Amaghị",
				fr: "Inconnu",
				ua: "Невідомо",
			},
		},
	},
	general: {
		unknownUser: {
			ger: "Unbekannt",
			eng: "Unknown",
			nig: "Amaghị",
			fr: "Inconnu",
			ua: "Невідомо",
		},
	},
	renderFriendRequests: {
		receivedTitle: {
			ger: "Empfangene Anfragen",
			eng: "Received Requests",
			nig: "Arịrịọ nataara",
			fr: "Demandes reçues",
			ua: "Отримані запити",
		},
		sentTitle: {
			ger: "Gesendete Anfragen",
			eng: "Sent Requests",
			nig: "Arịrịọ zigara",
			fr: "Demandes envoyées",
			ua: "Відправлені запити",
		},
		noReceived: {
			ger: "Keine empfangenen Anfragen.",
			eng: "No received requests.",
			nig: "Enweghị arịrịọ natara.",
			fr: "Aucune demande reçue.",
			ua: "Немає отриманих запитів.",
		},
		noSent: {
			ger: "Keine gesendeten Anfragen.",
			eng: "No sent requests.",
			nig: "Enweghị arịrịọ zigara.",
			fr: "Aucune demande envoyée.",
			ua: "Немає відправлених запитів.",
		},
	},
	no_id_msg: {
		ger: "Keine Benutzer-ID übergeben.",
		eng: "No user ID provided.",
		nig: "Enweghị ID onye ọrụ enyere.",
		fr: "Aucun identifiant utilisateur fourni.",
		ua: "Не передано ідентифікатор користувача.",
	},
	missing_req_dom_elem: {
		ger: "Benötigtes DOM-Element fehlt.",
		eng: "Required DOM element is missing.",
		nig: "Ihe dị mkpa DOM adịghị.",
		fr: "Élément DOM requis manquant.",
		ua: "Відсутній необхідний DOM-елемент.",
	},
	chat: {
		ger: "Chat",
		eng: "Chat",
		nig: "Mkparịta ụka",
		fr: "Discussion",
		ua: "Чат"
	},
	translationObj: {
		ger: "Chat",
		eng: "Chat",
		nig: "Mkparịta ụka",
		fr: "Discussion",
		ua: "Чат"
	},
	unknown: {
		ger: "Unbekannt",
		eng: "Unknown",
		nig: "Amaghị",
		fr: "Inconnu",
		ua: "Невідомо",
	},

};



export function t(obj: trans, langCode: string): string {
	return obj[langCode as keyof trans] || obj.eng;
}
