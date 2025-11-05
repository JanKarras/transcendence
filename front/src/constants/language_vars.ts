import { trans } from "./structs.js";

export const AVAILABLE_LANGUAGES = [
	{ code: "eng", label: "English", flag: "./assets/img/lang/gb-eng.webp" },
	{ code: "de", label: "Deutsch", flag: "./assets/img/lang/de.webp" },
	{ code: "ua", label: "Українська", flag: "./assets/img/lang/ua.webp" },
	{ code: "bel", label: "Беларуская", flag: "./assets/img/lang/bel.webp" },
];

export const lang = {
	playNowBtn: {
		ger: "Jetzt spielen!",
		eng: "Ready for the next match?",
		nig: "Nzube ọzọ dị njikere?",
		fr: "Prêt pour le prochain match ?",
		ua: "Готові до наступного матчу?",
		bel: "Гатовы да наступнага матчу?"
	},

	readyTitle: {
		ger: "Bereit für das nächste Match?",
		eng: "Ready for the next match?",
		nig: "Nzube ọzọ dị njikere?",
		fr: "Prêt pour le prochain match ?",
		ua: "Готові до наступного матчу?",
		bel: "Гатовы да наступнага матчу?"
	},
	readySubtitle: {
		ger: "Spiele online Ping Pong gegen Freunde oder im Turnier!",
		eng: "Play online Ping Pong against friends or compete in a tournament!",
		nig: "Kporie Ping Pong n'ịntanetị megide enyi ma ọ bụ sonye na asọmpi!",
		fr: "Jouez au ping-pong en ligne contre des amis ou participez à un tournoi !",
		ua: "Грайте в настільний теніс онлайн з друзями або беріть участь у турнірі!",
		bel: "Гуляйце ў пінг-понг анлайн супраць сяброў або ўдзельнічайце ў турніры!"
	},
	playTitle: {
		ger: "Spielen",
		eng: "Play",
		nig: "Kporie",
		fr: "Jouer",
		ua: "Грати",
		bel: "Гуляць"
	},
	playDesc: {
		ger: "Starte ein schnelles Spiel",
		eng: "Start a quick match",
		nig: "Malite egwuregwu ozugbo",
		fr: "Commencez une partie rapide",
		ua: "Почніть швидкий матч",
		bel: "Пачаць хуткi матч"
	},
	tournamentTitle: {
		ger: "Turnier",
		eng: "Tournament",
		nig: "Asọmpi",
		fr: "Tournoi",
		ua: "Турнір",
		bel: "Турнір"
	},
	tournamentDesc: {
		ger: "Starte ein Turnier",
		eng: "Start a tournament",
		nig: "Malite asọmpi",
		fr: "Lancez un tournoi",
		ua: "Почніть турнір",
		bel: "Пачаць турнір"
	},
	tournamentBtn: {
		ger: "Jetzt starten!",
		eng: "Start now!",
		nig: "Malite ugbu a!",
		fr: "Commencer maintenant !",
		ua: "Почати зараз!",
		bel: "Пачаць зараз!"
	},
	onlinePlayers: {
		ger: "Spieler online",
		eng: "Online Players",
		nig: "Ụmụ egwuregwu dị n'ịntanetị",
		fr: "Joueurs en ligne",
		ua: "Гравців онлайн",
		bel: "Гульцы анлайн"
	},
	activeTournaments: {
		ger: "Aktive Turniere",
		eng: "Active Tournaments",
		nig: "Asọmpi dị na-aga",
		fr: "Tournois actifs",
		ua: "Активні турніри",
		bel: "Актыўныя турнiры"
	},
	matchesToday: {
		ger: "Spiele heute",
		eng: "Matches Today",
		nig: "Egwuregwu taa",
		fr: "Matchs aujourd'hui",
		ua: "Матчів сьогодні",
		bel: "Матчэй сёння"
	},

	emailTitle: {
		ger: "E-Mail bestätigen",
		eng: "Email Validation",
		fr: "Validation d'e-mail",
		ua: "Підтвердження електронної пошти",
		bel: "Падцверджанне электроннай пошты",
		nig: "Nyocha Email"
	},
	emailInstruction: {
		ger: "Bitte gib den 6-stelligen Code ein, den wir gesendet haben an",
		eng: "Please enter the 6-digit code sent to",
		fr: "Veuillez entrer le code à 6 chiffres envoyé à",
		ua: "Будь ласка, введіть 6-значний код, надісланий на",
		bel: "Калі ласка, увядзіце 6-значны код, адпраўлены на",
		nig: "Biko tinye koodu 6 nke a zitere na"
	},
	emailVerifyBtn: {
		ger: "E-Mail bestätigen",
		eng: "Verify Email",
		fr: "Vérifier l'e-mail",
		ua: "Підтвердити email",
		bel: "Пацвердзіце адрас электроннай пошты",
		nig: "Nyocha Email"
	},
	emailMissingWarning: {
		ger: "Bitte verwende den Link aus deiner E-Mail! Du wirst in 3 Sekunden zum Login weitergeleitet.",
		eng: "Please use the link we sent you! You will be redirected to login in 3 seconds.",
		fr: "Veuillez utiliser le lien que nous vous avons envoyé ! Redirection vers la connexion dans 3 secondes.",
		ua: "Будь ласка, скористайтесь посиланням, яке ми вам надіслали! Вас буде перенаправлено до входу через 3 секунди.",
		bel: "Калі ласка, скарыстайцеся спасылкай, якую мы вам даслалі! Вы будзеце перанакіраваны на старонку ўваходу праз 3 секунды.",
		nig: "Biko jiri njikọ anyị zitere gị! Ị ga-agba ọsọ gaa na nbanye n'ime sekọnd 3."
	},

	loginTitle: {
		ger: "Login",
		eng: "Login",
		fr: "Connexion",
		ua: "Вхід",
		bel: "Уваход",
		nig: "Nbanye"
	},
	loginUserField: {
		ger: "Benutzername oder E-Mail:",
		eng: "Username or Email:",
		fr: "Nom d’utilisateur ou e-mail :",
		ua: "Ім’я користувача або електронна пошта:",
		bel: "Імя карыстальніка або адрас электроннай пошты",
		nig: "Aha njirimara ma ọ bụ Email:"
	},
	loginPasswordField: {
		ger: "Passwort:",
		eng: "Password:",
		fr: "Mot de passe :",
		ua: "Пароль:",
		bel: "Пароль:",
		nig: "Okwuntughe:"
	},
	loginBtn: {
		ger: "Einloggen",
		eng: "Login",
		fr: "Se connecter",
		ua: "Увійти",
		bel: "Увайсцi",
		nig: "Banye"
	},
	loginToRegisterBtn: {
		ger: "Registrieren",
		eng: "Register",
		fr: "S’inscrire",
		ua: "Зареєструватися",
		bel: "Зарэгістравацца",
		nig: "Debanye"
	},

	dashboard: {
		ger: "Dashboard",
		eng: "Dashboard",
		fr: "Tableau de bord",
		ua: "Дашборд",
		bel: "Панэль кiравання",
		nig: "Dashbọọdụ"
	},
	profileDbError: {
		ger: "Datenbankfehler. Du wirst ausgeloggt.",
		eng: "Database error. You will be logged out.",
		fr: "Erreur de base de données. Vous serez déconnecté.",
		ua: "Помилка бази даних. Вас буде виведено.",
		bel: "Памылка базы дадзеных. Вы выйдзеце з сістэмы.",
		nig: "Njehie n'ọrụ nchekwa. A ga-apụ gị."
	},
	profileAgeUnknown: {
		ger: "Nicht angegeben",
		eng: "Not provided",
		fr: "Non fourni",
		ua: "Не вказано",
		bel: "не пазначана",
		nig: "Enweghị"
	},
	profileChangePhoto: {
		ger: "Ändern",
		eng: "Change",
		fr: "Changer",
		ua: "Змінити",
		bel: "Змянiць",
		nig: "Gbanwe"
	},
	profileSaveBtn: {
		ger: "Speichern",
		eng: "Save",
		fr: "Enregistrer",
		ua: "Зберегти",
		bel: "Захаваць",
		nig: "Chekwaa"
	},
	profileCancelBtn: {
		ger: "Abbrechen",
		eng: "Cancel",
		fr: "Annuler",
		ua: "Скасувати",
		bel: "Адмянiць",
		nig: "Kwụsị"
	},
	profileLabel_username: {
		ger: "Benutzername",
		eng: "Username",
		fr: "Nom d’utilisateur",
		ua: "Ім'я користувача",
		bel: "Імя карыстальніка",
		nig: "Aha njirimara"
	},
	profileLabel_first_name: {
		ger: "Vorname",
		eng: "First Name",
		fr: "Prénom",
		ua: "Ім’я",
		bel: "Імя",
		nig: "Aha mbụ"
	},
	profileLabel_last_name: {
		ger: "Nachname",
		eng: "Last Name",
		fr: "Nom de famille",
		ua: "Прізвище",
		bel: "Прозвiшча",
		nig: "Aha ezinụlọ"
	},
	profileLabel_age: {
		ger: "Alter",
		eng: "Age",
		fr: "Âge",
		ua: "Вік",
		bel: "Узрост",
		nig: "Afọ"
	},
	profileLabel_last_seen: {
		ger: "Zuletzt online",
		eng: "Last seen",
		fr: "Dernière connexion",
		ua: "Останнє відвідування",
		bel: "Апошні раз анлайн",
		nig: "Hụ ikpeazụ"
	},
	registerTitle: {
		eng: "Register",
		ger: "Registrieren",
		nig: "Debanye",
		fr: "S'inscrire",
		ua: "Реєстрація",
		bel: "Рэгістрацыя",
	},
	registerUsername: {
		eng: "Username",
		ger: "Benutzername",
		nig: "Aha njirimara",
		fr: "Nom d'utilisateur",
		ua: "Ім'я користувача",
		bel: "Імя карыстальніка",
	},
	registerEmail: {
		eng: "Email",
		ger: "E-Mail",
		nig: "Imel",
		fr: "E-mail",
		ua: "Електронна пошта",
		bel: "Электронная пошта",
	},
	registerPassword: {
		eng: "Password",
		ger: "Passwort",
		nig: "Okwuntughe",
		fr: "Mot de passe",
		ua: "Пароль",
		bel: "Пароль",
	},
	registerPasswordConfirm: {
		eng: "Confirm Password",
		ger: "Passwort bestätigen",
		nig: "Kwado okwuntughe",
		fr: "Confirmez le mot de passe",
		ua: "Підтвердіть пароль",
		bel: "Пацвердзіць пароль",
	},
	registerBtn: {
		eng: "Register",
		ger: "Registrieren",
		nig: "Debanye",
		fr: "S'inscrire",
		ua: "Зареєструватися",
		bel: "Зарэгістравацца",
	},
	backBtn: {
		eng: "Back",
		ger: "Zurück",
		nig: "Laghachi",
		fr: "Retour",
		ua: "Назад",
		bel: "Назад",
	},
	emailTitle2: {
		ger: "E-Mail bestätigen",
		eng: "Email Validation",
		fr: "Validation d'e-mail",
		ua: "Підтвердження електронної пошти",
		bel: "Падцверджанне электроннай пошты",
		nig: "Nyocha Email"
	},
	emailInstruction2: {
		ger: "Bitte gib den 6-stelligen Code ein, den wir gesendet haben an",
		eng: "Please enter the 6-digit code sent to",
		fr: "Veuillez entrer le code à 6 chiffres envoyé à",
		ua: "Будь ласка, введіть 6-значний код, надісланий на",
		bel: "Калі ласка, увядзіце 6-значны код, адпраўлены на",
		nig: "Biko tinye koodu 6 nke a zitere na"
	},
	emailVerifyBtn2: {
		ger: "E-Mail bestätigen",
		eng: "Verify Email",
		fr: "Vérifier l'e-mail",
		ua: "Підтвердити email",
		bel: "Падцвердзiце электронную пошту",
		nig: "Nyocha Email"
	},
	showFriendsBtn: {
		ger: "👥 Freunde anzeigen",
		eng: "👥 Show Friends",
		fr: "👥 Voir les amis",
		ua: "👥 Показати друзів",
		bel: "👥 Паказаць сяброў",
		nig: "👥 Gosi Ndị enyi"
	},
	noFriends: {
		ger: "Keine Freunde",
		eng: "No friends",
		fr: "Aucun ami",
		ua: "Немає друзів",
		bel: "Няма сяброў",
		nig: "Enweghị ndị enyi"
	},
	online: {
		ger: "Online",
		eng: "Online",
		fr: "En ligne",
		ua: "Онлайн",
		bel: "Анлайн",
		nig: "N'ịntanetị"
	},
	offline: {
		ger: "Offline",
		eng: "Offline",
		fr: "Hors ligne",
		ua: "Офлайн",
		bel: "Афлайн",
		nig: "Na-apụ n'ịntanetị"
	},
	startChat: {
		ger: "Chat starten",
		eng: "Start chat",
		fr: "Démarrer le chat",
		ua: "Почати чат",
		bel: "Пачаць чат",
		nig: "Bido mkparịta ụka"
	},
	startGame: {
		ger: "Spiel starten",
		eng: "Start game",
		fr: "Démarrer le jeu",
		ua: "Почати гру",
		bel: "Пачаць гульню",
		nig: "Bido egwuregwu"
	},

	profile: {
		ger: "Profil",
		eng: "Profile",
		fr: "Profil",
		ua: "Профіль",
		bel: "Профіль",
		nig: "Nkọwapụta onwe"
	},

	dashboard2: {
		ger: "Dashboard",
		eng: "Dashboard",
		fr: "Tableau de bord",
		ua: "Панель",
		bel: "Панэль",
		nig: "Dashboard"
	},
	logout: {
		ger: "Abmelden",
		eng: "Logout",
		fr: "Déconnexion",
		ua: "Вийти",
		bel: "Выйсцi",
		nig: "Pụọ"
	},
	languageLabel: {
		ger: "🌐 Sprache:",
		eng: "🌐 Language:",
		fr: "🌐 Langue:",
		ua: "🌐 Мова:",
		bel: "🌐 Мова:",
		nig: "🌐 Asụsụ:"
	},

	successDefaultMessage: {
		ger: "Erfolg!",
		eng: "Success!",
		fr: "Succès !",
		ua: "Успіх!",
		bel: "Поспех!",
		nig: "Ihe gara nke ọma!"
	},
	errorDefaultMessage: {
		ger: "Ein Fehler ist aufgetreten.",
		eng: "An error occurred.",
		fr: "Une erreur s'est produite.",
		ua: "Виникла помилка.",
		bel: "Узнікла памылка.",
		nig: "Mperede mere."
	},

	loginRequired: {
		ger: "Du musst eingeloggt sein, um diese Seite zu sehen.",
		eng: "You must be logged in to access this page.",
		fr: "Vous devez être connecté pour accéder à cette page.",
		ua: "Ви повинні увійти, щоб переглянути цю сторінку.",
		bel: "Каб атрымаць доступ да гэтай старонкі, вы павінны ўвайсці ў сістэму.",
		nig: "Ị ga-abụ onye nbanye ka i nwee ike ịhụ ibe a."
	},

	friendsOnline: {
		ger: "Freunde Online",
		eng: "Friends Online",
		fr: "Amis en ligne",
		ua: "Друзі онлайн",
		bel: "Сябры анлайн",
		nig: "Ụfọdụ enyi nọ n'ịntanetị"
	},
	allFriends: {
		ger: "Alle Freunde",
		eng: "All friends",
		fr: "Amis offline",
		ua: "Усі друзі",
		bel: "Усе сябры",
		nig: "Enyi niile"
	},
	addFriends: {
		ger: "Freunde hinzufügen",
		eng: "Add Friends",
		fr: "Ajouter des amis",
		ua: "Додати друзів",
		bel: "Дадаць сяброў",
		nig: "Tinye ndị enyi"
	},
	friendRequests: {
		ger: "Anfragen",
		eng: "Requests",
		fr: "Demandes",
		ua: "Запити",
		bel: "Запыты",
		nig: "Arịrịọ"
	},
	domLoadError: {
		ger: "Fehler beim Laden des DOM. Du wirst ausgeloggt. Bitte versuche es später erneut.",
		eng: "Error with DOM loading. You will be logged out. Please try again later.",
		fr: "Erreur lors du chargement du DOM. Vous serez déconnecté. Veuillez réessayer plus tard.",
		ua: "Помилка завантаження DOM. Вас буде виведено з системи. Будь ласка, спробуйте пізніше.",
		bel: "Памылка загрузкі DOM. Вы выйдзеце з сістэмы. Паўтарыце спробу пазней.",
		nig: "Njehie na mbubata DOM. A ga-ewepụ gị. Biko nwalee ọzọ."
	},
	name: {
		ger: "Name",
		eng: "Name",
		fr: "Nom",
		ua: "Ім'я",
		bel: "Имя",
		nig: "Aha"
	},
	age: {
		ger: "Alter",
		eng: "Age",
		fr: "Âge",
		ua: "Вік",
		bel: "Узрост",
		nig: "Afọ"
	},
	wins: {
		ger: "Siege",
		eng: "Wins",
		fr: "Victoires",
		ua: "Перемоги",
		bel: "Перамогі",
		nig: "Mmeri"
	},
	loses: {
		ger: "Niederlagen",
		eng: "Loses",
		fr: "Défaites",
		ua: "Поразки",
		bel: "Паражэнні",
		nig: "Nfu"
	},
	tournamentWins: {
		ger: "Turnier-Siege",
		eng: "Tournament Wins",
		fr: "Victoires en tournoi",
		ua: "Перемоги в турнірах",
		bel: "Перамогі ў турнірах",
		nig: "Mmeri asọmpi"
	},

	startMatch: {
		ger: "Match starten",
		eng: "Start Match",
		fr: "Démarrer le match",
		ua: "Почати матч",
		bel: "Пачаць матч",
		nig: "Malite Egwuregwu"
	},
	chatWith: {
		ger: "Chat mit",
		eng: "Chat with",
		fr: "Discuter avec",
		ua: "Чат з",
		bel: "Чат з",
		nig: "Mkparịta ụka na"
	},
	inviteToGame: {
		ger: "Spiel-Einladung an",
		eng: "Invite to game",
		fr: "Invitation au jeu",
		ua: "Запрошення до гри",
		bel: "Запрашэнні да гульнi",
		nig: "Nkwenye egwuregwu"
	},
	requestsLater: {
		ger: "Anfragen werden später geladen...",
		eng: "Requests will be loaded later...",
		fr: "Les demandes seront chargées plus tard...",
		ua: "Запити будуть завантажені пізніше...",
		bel: "Запыты будуць загружаны пазней...",
		nig: "A ga-ebudata arịrịọ mgbe e mesịrị..."
	},

	databaseError: {
		ger: "Datenbankfehler. Du wirst ausgeloggt.",
		eng: "Database Error. You will be logged out.",
		fr: "Erreur de base de données. Vous serez déconnecté.",
		ua: "Помилка бази даних. Ви будете виведені з системи.",
		bel: "Памылка базы дадзеных. Вы выйдзеце з сістэмы.",
		nig: "Njehie nchekwa data. A ga-ewepụ gị."
	},

	invalidCode: {
		ger: "Bitte gib einen gültigen 6-stelligen Code ein.",
		eng: "Please enter a valid 6-digit code.",
		fr: "Veuillez entrer un code valide à 6 chiffres.",
		ua: "Будь ласка, введіть дійсний 6-значний код.",
		bel: "Калі ласка, увядзіце сапраўдны 6-значны код.",
		nig: "Biko tinye koodu 6 ziri ezi."
	},
	emailValidated: {
		ger: "Du hast deinen Account erfolgreich bestätigt. Du wirst in 3 Sekunden zum Login weitergeleitet.",
		eng: "You validated your account successfully. You will be redirected to login in 3 seconds.",
		fr: "Vous avez validé votre compte avec succès. Vous serez redirigé vers la connexion dans 3 secondes.",
		ua: "Ви успішно підтвердили свій акаунт. Ви будете перенаправлені до входу через 3 секунди.",
		bel: "Вы паспяхова пацвердзілі свой акаўнт. Праз 3 секунды вы будзеце перанакіраваны на старонку ўваходу.",
		nig: "Ị kwadoro akaụntụ gị nke ọma. A ga-ebufe gị na nbanye n'ime sekọnd 3."
	},

	loginSuccess: {
		ger: "Login erfolgreich für Benutzer {username}",
		eng: "Login successful for user {username}",
		fr: "Connexion réussie pour l'utilisateur {username}",
		ua: "Вхід успішний для користувача {username}",
		bel: "Паспяховы ўваход карыстальніка {username}",
		nig: "Nbanye gara nke ọma maka onye ọrụ {username}"
	},
	loginFailed: {
		ger: "Login fehlgeschlagen: {error}",
		eng: "Login failed: {error}",
		fr: "Échec de la connexion : {error}",
		ua: "Помилка входу: {error}",
		bel: "Памылка ўваходу: {error}",
		nig: "Nbanye dara ada: {error}"
	},

	passwordLength: {
		ger: "Das Passwort muss mindestens 8 Zeichen lang sein.",
		eng: "Password must be at least 8 characters long.",
		fr: "Le mot de passe doit contenir au moins 8 caractères.",
		ua: "Пароль повинен містити щонайменше 8 символів.",
		bel: "Пароль павінен быць не менш за 8 сімвалаў.",
		nig: "Paswọọdụ ga-adịkarị nkeji 8 ma ọ dịkarịa ala."
	},
	passwordUppercase: {
		ger: "Das Passwort muss mindestens einen Großbuchstaben enthalten.",
		eng: "Password must contain at least one uppercase letter.",
		fr: "Le mot de passe doit contenir au moins une lettre majuscule.",
		ua: "Пароль повинен містити принаймні одну велику літеру.",
		bel: "Пароль павінен мець хаця б адну вялікую літару.",
		nig: "Paswọọdụ ga-enwe otu mkpụrụedemede ukwu."
	},
	passwordLowercase: {
		ger: "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.",
		eng: "Password must contain at least one lowercase letter.",
		fr: "Le mot de passe doit contenir au moins une lettre minuscule.",
		ua: "Пароль повинен містити принаймні одну маленьку літеру.",
		bel: "Пароль павінен мець хаця б адну маленькую літару.",
		nig: "Paswọọdụ ga-enwe otu mkpụrụedemede obere."
	},
	passwordNumber: {
		ger: "Das Passwort muss mindestens eine Zahl enthalten.",
		eng: "Password must contain at least one number.",
		fr: "Le mot de passe doit contenir au moins un chiffre.",
		ua: "Пароль повинен містити принаймні одну цифру.",
		bel: "Пароль павінен мець хаця б адну лiчбу.",
		nig: "Paswọọdụ ga-enwe otu nọmba."
	},
	passwordSpecialChar: {
		ger: "Das Passwort muss mindestens ein Sonderzeichen enthalten.",
		eng: "Password must contain at least one special character.",
		fr: "Le mot de passe doit contenir au moins un caractère spécial.",
		ua: "Пароль повинен містити принаймні один спеціальний символ.",
		bel: "Пароль павінен мець хаця б адзін спецыяльны сімвал.",
		nig: "Paswọọdụ ga-enwe otu akara pụrụ iche."
	},
	passwordNoSpaces: {
		ger: "Das Passwort darf keine Leerzeichen enthalten.",
		eng: "Password cannot contain spaces.",
		fr: "Le mot de passe ne peut pas contenir d'espaces.",
		ua: "Пароль не може містити пробілів.",
		bel: "",
		nig: "Paswọọdụ apụghị ịnwe oghere."
	},
	passwordMismatch: {
		ger: "Passwörter stimmen nicht überein!",
		eng: "Passwords do not match!",
		fr: "Les mots de passe ne correspondent pas!",
		ua: "Паролі не співпадають!",
		bel: "Пароль не можа ўтрымліваць прабелы.",
		nig: "Paswọọdụ adịghị dakọtara!"
	},
	unknownError: {
		ger: "Unbekannter Fehler",
		eng: "Unknown error",
		fr: "Erreur inconnue",
		ua: "Невідома помилка",
		bel: "Невядомая памылка",
		nig: "Ihe mberede amaghị"
	},
	registerSuccess: {
		ger: "Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.",
		eng: "Registration was successful. Please remember to validate your email address.",
		fr: "L'inscription a réussi. Veuillez valider votre adresse e-mail.",
		ua: "Реєстрація пройшла успішно. Будь ласка, підтвердьте свою електронну адресу.",
		bel: "Рэгістрацыя прайшла паспешна. Калі ласка, не забудзьце падцвердзіць свой адрас электроннай пошты.",
		nig: "Enyemaka debanye aha gara nke ọma. Biko gosi email gi."
	},
	registerFailed: {
		ger: "Registrierung fehlgeschlagen: {error}",
		eng: "Registration failed: {error}",
		fr: "Échec de l'inscription : {error}",
		ua: "Помилка реєстрації: {error}",
		bel: "Памылка рэгістрацыi: {error}",
		nig: "Ndebanye aha dara ada: {error}"
	},

	invalid6DigitCode: {
		ger: "Bitte gib einen gültigen 6-stelligen Code ein.",
		eng: "Please enter a valid 6-digit code.",
		fr: "Veuillez saisir un code valide à 6 chiffres.",
		ua: "Будь ласка, введіть дійсний 6-значний код.",
		bel: "Калі ласка, увядзіце сапраўдны 6-значны код.",
		nig: "Biko tinye koodu ziri ezi nke mkpụrụ 6."
	},
	twoFASuccess: {
		ger: "2FA war erfolgreich. Du wirst in 3 Sekunden zum Dashboard weitergeleitet.",
		eng: "2FA was successful. You will be redirected to the dashboard in 3 seconds.",
		fr: "2FA a réussi. Vous serez redirigé vers le tableau de bord dans 3 secondes.",
		ua: "2FA пройшло успішно. Вас буде перенаправлено на панель керування через 3 секунди.",
		bel: "Двухфактарная аўтэнтыфікацыя прайшла паспяхова. Вы будзеце перанакіраваны на панэль кіравання праз 3 секунды.",
		nig: "2FA gara nke ọma. A ga-eduga gị na dashboard n’ime sekọnd atọ."
	},

	friends: {
		ger: "Freunde",
		eng: "Friends",
		fr: "Amis",
		ua: "Друзі",
		bel: "Сябры",
		nig: "Enyi"
	},

	unfriend: {
		ger: "Freund entfernen",
		eng: "Unfriend",
		fr: "Supprimer ami",
		ua: "Видалити друга",
		bel: "Выдаліць з сяброў",
		nig: "Hapụ enyi",
	},
	addFriend: {
		ger: "Freund hinzufügen",
		eng: "Add Friend",
		fr: "Ajouter un ami",
		ua: "Додати друга",
		bel: "Дадаць сябра",
		nig: "Tinye enyi",
	},
	searchFriend: {
		ger: "Freund suchen...",
		eng: "Search friend...",
		fr: "Rechercher un ami...",
		ua: "Пошук друга...",
		bel: "Пошук сябра...",
		nig: "Chọọ enyi...",
	},
	confirmUnfriend: {
		ger: "Möchtest du {username} wirklich entfernen?",
		eng: "Do you really want to remove {username}?",
		fr: "Voulez-vous vraiment supprimer {username} ?",
		ua: "Ви дійсно хочете видалити {username}?",
		bel: "Вы сапраўды хочаце выдаліць {username}?",
		nig: "Ị chọrọ iwepu {username} n’ezie?",
	},
	friendRequestSent: {
		ger: "Freundschaftsanfrage an {username} gesendet.",
		eng: "Friend request sent to {username}.",
		fr: "Demande d'ami envoyée à {username}.",
		ua: "Запит дружби надіслано до {username}.",
		bel: "Запыт у сябры адпраўлены {username}.",
		nig: "Izitere {username} arịrịọ enyi.",
	},
	friendRequestFailed: {
		ger: "Freundschaftsanfrage an {username} fehlgeschlagen.",
		eng: "Friend request to {username} failed.",
		fr: "Échec de la demande d'ami à {username}.",
		ua: "Не вдалося надіслати запит дружби до {username}.",
		bel: "Не атрымалася адправіць запыт у сябры да {username}.",
		nig: "Arịrịọ enyi gara na {username} emerughị emezu.",
	},
	friendRequestAccepted: {
		ger: "Freundschaftsanfrage von {username} akzeptiert.",
		eng: "Friend request from {username} accepted.",
		fr: "Demande d'ami de {username} acceptée.",
		ua: "Запит дружби від {username} прийнято.",
		bel: "Запыт у сябры ад {username} прыняты.",
		nig: "Anabatara arịrịọ enyi si {username}.",
	},
	friendRequestAcceptFailed: {
		ger: "Annehmen der Freundschaftsanfrage von {username} fehlgeschlagen.",
		eng: "Failed to accept friend request from {username}.",
		fr: "Échec de l'acceptation de la demande d'ami de {username}.",
		ua: "Не вдалося прийняти запит дружби від {username}.",
		bel: "Не атрымалася прыняць запыт у сябры ад {username}.",
		nig: "Ọ dịghị arụsi ike ịnakwere arịrịọ enyi si {username}.",
	},
	friendRequestDeclined: {
		ger: "Freundschaftsanfrage von {username} abgelehnt.",
		eng: "Friend request from {username} declined.",
		fr: "Demande d'ami de {username} refusée.",
		ua: "Запит дружби від {username} відхилено.",
		bel: "Запыт у сябры ад {username} адхілены.",
		nig: "Ajụla arịrịọ enyi si {username}.",
	},
	friendRequestDeclineFailed: {
		ger: "Ablehnen der Freundschaftsanfrage von {username} fehlgeschlagen.",
		eng: "Failed to decline friend request from {username}.",
		fr: "Échec du refus de la demande d'ami de {username}.",
		ua: "Не вдалося відхилити запит дружби від {username}.",
		bel: "Не атрымалася адхіліць запыт у сябры ад {username}.",
		nig: "Ọ dịghị arụsi ike ịjụ arịrịọ enyi si {username}.",
	},
	friendRemoved: {
		ger: "{username} wurde aus deiner Freundesliste entfernt.",
		eng: "{username} has been removed from your friends list.",
		fr: "{username} a été retiré de votre liste d'amis.",
		ua: "{username} було видалено з вашого списку друзів.",
		bel: "{username} быў выдалены са спісу вашых сяброў.",
		nig: "E wepụrụ {username} n'usoro ndị enyi gị.",
	},
	friendRemoveFailed: {
		ger: "Entfernen von {username} aus deiner Freundesliste fehlgeschlagen.",
		eng: "Failed to remove {username} from your friends list.",
		fr: "Échec de la suppression de {username} de votre liste d'amis.",
		ua: "Не вдалося видалити {username} зі списку друзів.",
		bel: "Не атрымалася выдаліць {username} са спісу сяброў.",
		nig: "Ọ dịghị arụsi ike iwepụ {username} n'usoro ndị enyi gị.",
	},
	status: {
		nothandled: {
			ger: "Anfrage ausstehend",
			eng: "Request pending",
			nig: "Arịrịọ ka na-eche",
			fr: "Demande en attente",
			ua: "Запит у очікуванні",
			bel: "Запыт чакае разгляду"
		},
		accepted: {
			ger: "Anfrage angenommen",
			eng: "Request accepted",
			nig: "Arịrịọ anabatara",
			fr: "Demande acceptée",
			ua: "Запит прийнято",
			bel: "Запыт прыняты"
		},
		declined: {
			ger: "Anfrage abgelehnt",
			eng: "Request declined",
			nig: "Arịrịọ ajụrụ",
			fr: "Demande refusée",
			ua: "Запит відхилено",
			bel: "Запыт адхілены"
		},
		unknown: {
			ger: "Status unbekannt",
			eng: "Unknown status",
			nig: "Ọnọdụ amaghị",
			fr: "Statut inconnu",
			ua: "Невідомий статус",
			bel: "Невядомы статус"
		}
	},
	requestBox: {
		friendRequestRecv: {
			ger: "möchte dich als Freund hinzufügen",
			eng: "wants to add you as a friend",
			nig: "chọrọ itinye gị dị ka enyi",
			fr: "veut vous ajouter comme ami",
			ua: "хоче додати вас у друзі",
			bel: "хоча дадаць вас ў сябры"
		},
		gameInviteRecv: {
			ger: "lädt dich zu einem Spiel ein",
			eng: "invites you to a game",
			nig: "kpọrọ gị ka ị bịa n’egwuregwu",
			fr: "vous invite à un jeu",
			ua: "запрошує вас до гри",
			bel: "запрашае вас на гульню"
		},
		friendRequestSend: {
			ger: "Du hast eine Freundschaftsanfrage gesendet",
			eng: "You sent a friend request",
			nig: "Izitere arịrịọ enyi",
			fr: "Vous avez envoyé une demande d'ami",
			ua: "Ви надіслали запит у друзі",
			bel: "Вы адправілі запыт у сябры"
		},
		gameInviteSend: {
			ger: "Du hast eine Spieleinladung gesendet",
			eng: "You sent a game invite",
			nig: "Izitere ọkpọ egwuregwu",
			fr: "Vous avez envoyé une invitation à un jeu",
			ua: "Ви надіслали запрошення до гри",
			bel: "Вы адправілі запрашэнне ў гульню"
		},
		accept: {
			ger: "Annehmen",
			eng: "Accept",
			nig: "Nabata",
			fr: "Accepter",
			ua: "Прийняти",
			bel: "Прыняць"
		},
		decline: {
			ger: "Ablehnen",
			eng: "Decline",
			nig: "Jụ",
			fr: "Refuser",
			ua: "Відхилити",
			bel: "Адхіліць"
		},
		status: {
			nothandled: {
				ger: "Ausstehend",
				eng: "Pending",
				nig: "Na-eche",
				fr: "En attente",
				ua: "В очікуванні",
				bel: "Чакаецца"
			},
			accepted: {
				ger: "Angenommen",
				eng: "Accepted",
				nig: "Anabatara",
				fr: "Accepté",
				ua: "Прийнято",
				bel: "Прынята"
			},
			declined: {
				ger: "Abgelehnt",
				eng: "Declined",
				nig: "Ajụrụ",
				fr: "Refusé",
				ua: "Відхилено",
				bel: "Адхілена"
			},
			unknown: {
				ger: "Unbekannt",
				eng: "Unknown",
				nig: "Amaghị",
				fr: "Inconnu",
				ua: "Невідомо",
				bel: "Невядома"
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
			bel: "Невядома"
		},
	},
	renderFriendRequests: {
		receivedTitle: {
			ger: "Empfangene Anfragen",
			eng: "Received requests",
			nig: "Arịrịọ nataara",
			fr: "Demandes reçues",
			ua: "Отримані запити",
			bel: "Атрыманыя запыты"
		},
		sentTitle: {
			ger: "Gesendete Anfragen",
			eng: "Sent requests",
			nig: "Arịrịọ zigara",
			fr: "Demandes envoyées",
			ua: "Відправлені запити",
			bel: "Адпраўленыя запыты"
		},
		noReceived: {
			ger: "Keine empfangenen Anfragen.",
			eng: "No received requests.",
			nig: "Enweghị arịrịọ natara.",
			fr: "Aucune demande reçue.",
			ua: "Немає отриманих запитів.",
			bel: "Няма атрыманых запытаў"
		},
		noSent: {
			ger: "Keine gesendeten Anfragen.",
			eng: "No sent requests.",
			nig: "Enweghị arịrịọ zigara.",
			fr: "Aucune demande envoyée.",
			ua: "Немає відправлених запитів.",
			bel: "Няма адпраўленых запытаў"
		},
	},
	no_id_msg: {
		ger: "Keine Benutzer-ID übergeben.",
		eng: "No user ID provided.",
		nig: "Enweghị ID onye ọrụ enyere.",
		fr: "Aucun identifiant utilisateur fourni.",
		ua: "Не передано ідентифікатор користувача.",
		bel: "Ідэнтыфікатар карыстальніка не пададзены.",
	},
	missing_req_dom_elem: {
		ger: "Benötigtes DOM-Element fehlt.",
		eng: "Required DOM element is missing.",
		nig: "Ihe dị mkpa DOM adịghị.",
		fr: "Élément DOM requis manquant.",
		ua: "Відсутній необхідний DOM-елемент.",
		bel: "Адсутнічае неабходны DOM элемент."
	},
	chat: {
		ger: "Chat",
		eng: "Chat",
		nig: "Mkparịta ụka",
		fr: "Discussion",
		ua: "Чат",
		bel: "Чат"
	},
	translationObj: {
		ger: "Chat",
		eng: "Chat",
		nig: "Mkparịta ụka",
		fr: "Discussion",
		ua: "Чат",
		bel: "Чат"
	},
	unknown: {
		ger: "Unbekannt",
		eng: "Unknown",
		nig: "Amaghị",
		fr: "Inconnu",
		ua: "Невідомо",
		bel: "Невядома",
	},
	matchHistoryTitle: {
		ger: "Spielverlauf",
		eng: "Match history",
		nig: "Akụkọ egwuregwu",
		fr: "Historique des matchs",
		ua: "Історія матчів",
		bel: "Гісторыя матчаў",
	},
	matchType1v1Local: {
		ger: "1v1 (Lokal)",
		eng: "1v1 (Local)",
		nig: "1v1 (Obodo)",
		fr: "1v1 (Local)",
		ua: "1v1 (Локально)",
		bel: "1v1 (Лакальна)",
	},
	matchType1v1Remote: {
		ger: "1v1 (Online)",
		eng: "1v1 (Remote)",
		nig: "1v1 (Ntanetị)",
		fr: "1v1 (En ligne)",
		ua: "1v1 (Віддалено)",
		bel: "1v1 (Дыстанцыйна)",
	},
	matchTypeTournament: {
		ger: "Turnier",
		eng: "Tournament",
		nig: "Asọmpi",
		fr: "Tournoi",
		ua: "Турнір",
		bel: "Турнір",
	},
	round: {
		ger: "Runde",
		eng: "Round",
		nig: "Ọgba",
		fr: "Manche",
		ua: "Раунд",
		bel: "Раунд",
	},
	score: {
		ger: "Punkte",
		eng: "Score",
		nig: "Nsonaazụ",
		fr: "Score",
		ua: "Рахунок",
		bel: "Балы",
	},
	backToProfile: {
		ger: "Zurück zum Profil",
		eng: "Back to Profile",
		nig: "Laghachi na profaịlụ",
		fr: "Retour au profil",
		ua: "Назад до профілю",
		bel: "Назад да профілю",
	},
	trophy: {
		ger: "🏆",
		eng: "🏆",
		nig: "🏆",
		fr: "🏆",
		ua: "🏆",
		bel: "🏆",
	},
	matchHis: {
		ger: "Spielverlauf",
		eng: "Match history",
		nig: "Akụkọ egwuregwu",
		fr: "Historique des matchs",
		ua: "Історія матчів",
		bel: "Гісторыя матчаў",
	},

	selectChatPartner: {
		ger: "Wähle einen chat partner aus",
		eng: "Select a chat partner",
		nig: "Sélectionnez un partenaire de discussion",
		fr: "Họrọ onye ị ga-akparịta ụka na ya",
		ua: "Виберіть співрозмовника",
	},

	enterMessage: {
		ger: "Nachricht schreiben",
		eng: "Enter massage",
		fr: "Saisir un message",
		nig: "Tinye ozi",
		ua: "Введіть повідомлення",
	},

	send: {
		ger: "verschicken",
		eng: "send",
		fr: "Envoyer",
		nig: "Zipu",
		ua: "Надіслати",
	},
	twofaEmail: {
		ger: "2FA-Code per E-Mail senden",
		eng: "Send 2FA code via email",
		nig: "Zipu koodu 2FA site na email",
		fr: "Envoyer le code 2FA par e-mail",
		ua: "Надіслати код 2FA електронною поштою"
	},
	active: {
		ger: "Aktiv",
		eng: "Active",
		nig: "Na-arụ ọrụ",
		fr: "Actif",
		ua: "Активний",
	},
	inactive: {
		ger: "Inaktiv",
		eng: "Inactive",
		nig: "Na-adịghị arụ ọrụ",
		fr: "Inactif",
		ua: "Неактивний",
	},
	activate : {
		ger: "Aktivieren",
		eng: "Activate",
		nig: "Mee ka ọ rụọ ọrụ",
		fr: "Activer",
		ua: "Активувати",
	},
	deactivate : {
		ger: "Deaktivieren",
		eng: "Deactivate",
		nig: "Gbanyụọ",
		fr: "Désactiver",
		ua: "Деактивувати",
	},
	game: {
		playAgain: {
			ger: "Willst du wieder spielen?",
			eng: "Do you want to play again?",
			fr: "Tu veux rejouer?",
			nig: "",
			ua: "",
			bel: ""
		},
		yes: {
			ger: "Ja",
			eng: "Yes",
			fr: "Oui",
			nig: "",
			ua: "",
			bel: ""
		},
		no: {
			ger: "Nein",
			eng: "No",
			fr: "Non",
			nig: "",
			ua: "",
			bel: ""
		},
		secondPlayerUsername: {
			ger: "Geben Sie den Benutzernamen des zweiten Spielers ein",
			eng: "Enter the username of the second player",
			fr: "",
			nig: "",
			ua: "",
			bel: ""
		},
		submit: {
			ger: "Einreichung",
			eng: "Submit",
			fr: "",
			nig: "",
			ua: "",
			bel: ""
		},
		cancel: {
			ger: "Abbrechen",
			eng: "Cancel",
			fr: "",
			nig: "",
			ua: "",
			bel: ""
		}
	}
};


export function t(obj: trans, langCode: string): string {
	return obj[langCode as keyof trans] || obj.eng;
}
