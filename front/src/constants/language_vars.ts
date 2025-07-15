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
};


export function t(obj: trans, langCode: string): string {
	return obj[langCode as keyof trans] || obj.eng;
}
