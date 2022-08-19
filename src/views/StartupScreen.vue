<template>
  <ion-page>
    <ion-content>
      <div class="brand-bg">
        <div class="startup-header">
          <ion-img src="assets/icon/monheim.svg" class="ic"/>
          <h2>Fahrradverleih</h2>
          <h3>Monheim am Rhein</h3>
        </div>

        <div class="startup-content">
          <!-- Authentifizierung / Token prüfen -->
          <div id="auth" v-show="state === 'auth'">
            <ion-spinner name="crescent" color="light"></ion-spinner>
            <p>Verbinde</p>
          </div>

          <!-- Willkommensseite -->
          <div id="welcome" v-show="state === 'welcome'">
            <h1>Willkommen!</h1>
            <ion-button fill="outline" @click="_redirect('login')">Anmelden</ion-button>
            <p>oder</p>
            <ion-button fill="outline" @click="_redirect('register')">Registrieren</ion-button>
          </div>

          <!-- Login-Formular -->
          <div id="login" v-show="state === 'login'">
            <div class="icon-input">
              <ion-icon src="assets/icon/ic_email.svg" size="large"></ion-icon>
              <ion-label>E-Mail Adresse</ion-label>
              <ion-input id="login-mail" type="email" v-model="loginMail"></ion-input>
            </div>
            <div class="icon-input">
              <ion-icon src="assets/icon/ic_lock.svg" size="large"></ion-icon>
              <ion-label>Passwort</ion-label>
              <ion-input id="login-pass" type="password" v-model="loginPass"></ion-input>
            </div>
            <ion-button fill="outline" @click="login()">Anmelden</ion-button>
          </div>

          <!-- Registrierung -->
          <div id="register" v-show="state === 'register'">
            <ion-title>Registrieren</ion-title>
            <!-- Funktion im Rahmen des Projektes nicht implementiert -->
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader, IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  toastController
} from "@ionic/vue";
import {Options, Vue} from "vue-class-component";
import Prefs from "@/util/prefs";
import {container} from "tsyringe";
import BenutzerService from "@/services/benutzer-service";

@Options({
  components: {
    IonPage, IonToolbar, IonContent, IonTitle, IonLabel, IonButton, IonHeader, IonImg,
    IonSpinner, IonInput, IonItem, IonIcon
  }
})
export default class StartupScreen extends Vue {
  /**
   * Zustand ohne Interaktion. Sollte bereits ein Token gespeichert sein, wird
   * überprüft, ob dieses noch vom Backend akzeptiert wird.
   * Ist es noch gültig, dann wird zur Hauptansicht weitergeleitet; falls nicht,
   * wird die Willkommensseite angezeigt.
   */
  public static readonly STATE_AUTH = "auth";

  /**
   * Zeigt eine einfache Willkommensseite an, die einen Login oder die
   * Registrierung innerhalb der App anbietet.
   */
  public static readonly STATE_WELCOME = "welcome";

  /**
   * Zeigt ein Login-Formular an.
   */
  public static readonly STATE_LOGIN = "login";

  /**
   * Zeigt ein Registrierungsformular an.
   */
  public static readonly STATE_REGISTER = "register";

  /**
   * Beschreibt den aktuellen Zustand des Screens und bestimmt damit, welche Inhalte
   * in dem primären Container gerendert werden.
   */
  public state = StartupScreen.STATE_AUTH;

  private prefs: Prefs = container.resolve(Prefs);
  private benutzerService: BenutzerService = container.resolve(BenutzerService);

  private busy = false;
  public loginMail = '';
  public loginPass = '';

  public async mounted(): Promise<void> {
    await this.prefs.init();
    this.navigate();
  }

  private navigate(path = this.$route.path) {
    // Zustand aus Path wiederherstellen
    switch (path) {
      default:
      case '/':
      case '/auth':
        this.state = StartupScreen.STATE_AUTH;
        this.auth();
        break;
      case '/login':
        this.state = StartupScreen.STATE_LOGIN;
        break;
      case '/register':
        this.state = StartupScreen.STATE_REGISTER;
        break;
      case '/welcome':
        this.state = StartupScreen.STATE_WELCOME;
        break;
    }
  }

  private async auth() {
    if (await this.prefs.get<string>(Prefs.KEY_TOKEN, '') === '') {
      // Kein Token gespeichert => Weiterleitung an /welcome
      await this._redirect(StartupScreen.STATE_WELCOME);
      return;
    }

    // Versuche Authentifizierung am Backend/Service mit gespeichertem Token
    this.benutzerService.auth()
        .then(() => this.$router.push("/tabs"))
        .catch(e => {
          // Lösche ungültiges Token
          this.prefs.remove(Prefs.KEY_TOKEN);

          toastController.create({
            header: "Authentifizierung fehlgeschlagen",
            message: `Bitte melden Sie sich neu an. Fehler: ${e.message}`,
            color: "warning",
            duration: 3000
          }).then(t => t.present());

          this._redirect(StartupScreen.STATE_WELCOME);
        });
  }

  private async login() {
    if (this.busy) return;
    this.busy = true;

    this.benutzerService.login(this.loginMail, this.loginPass)
        .then(async r => {
          if (r.ok && r.token) {
            // Token speichern
            await this.prefs.set<string>(Prefs.KEY_TOKEN, r.token);
            await this.benutzerService.init();
            await this._redirect(StartupScreen.STATE_AUTH);
          } else {
            toastController.create({
              header: "Anmeldung fehlgeschlagen",
              message: "Bitte prüfen Sie die Eingaben",
              color: "warning",
              duration: 3000
            }).then(t => t.present());
          }
        }).catch(e => {
      toastController.create({
        header: "Anmeldung fehlgeschlagen",
        message: `Fehler: ${e.message}`,
        color: "warning",
        duration: 5000
      }).then(t => t.present());
    }).finally(() => this.busy = false);
  }

  private async _redirect(dest: string) {
    const p = `/${dest}`;
    await this.$router.push({path: p});
    this.state = dest;
    this.navigate(p);
  }

}
</script>

<style scoped>
.brand-bg {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 0 0;
  grid-template-areas:
    "header"
    "content";

  height: 100%;
  width: 100%;

  --background: white url('../../public/assets/picture/startup.webp') no-repeat cover fixed center;
  background: white url('../../public/assets/picture/startup.webp') no-repeat fixed center;
  -webkit-background-size: cover;
  background-size: cover;
}

.startup-header {
  grid-area: header;

  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr 1fr;
  gap: .5em 1em;
  grid-template-areas:
    "icon title"
    "icon subtitle";
  justify-content: start;
  align-content: center;
  justify-items: start;
  align-items: center;

  background: rgba(2, 151, 220, 0.35);
  color: white;
  height: 7em;
}

.startup-header > .ic {
  grid-area: icon;
  height: 6em;

  margin: 1em;
}

.startup-header h2 {
  grid-area: title;
  margin: 0;
  justify-self: stretch;
  align-self: end;

  font-size: larger;
  font-weight: normal;
}

.startup-header h3 {
  grid-area: subtitle;
  margin: 0;
  justify-self: stretch;
  align-self: start;

  font-size: larger;
  font-weight: lighter;
}

.startup-content {
  grid-area: content;

  justify-self: stretch;
  align-self: center;
  text-align: center;

  background: rgba(255, 255, 255, 0.40);
  border: white 0;
  border-radius: 1.5em;

  padding: 1em;
  margin: 2em;
  max-width: 35em;

  color: white;
}

.startup-content h1 {
  font-weight: lighter;
  font-size: x-large;

  margin-bottom: 1.3em;
  margin-top: .3em;
}

.startup-content p {
  font-weight: lighter;
}

.startup-content ion-button {
  --border-radius: .75em;
  --border-color: white;
  --border-width: 1px;

  color: white;
  font-weight: normal;

  min-width: 15em;
}

.icon-input {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  gap: 0.1em .5em;
  grid-template-areas:
    "icon label"
    "icon input";

  margin-bottom: 1em;
}

.icon-input > ion-icon {
  justify-self: start;
  align-self: end;
  grid-area: icon;
}

.icon-input > ion-label {
  justify-self: start;
  align-self: end;
  grid-area: label;

  font-size: small;
  font-weight: lighter;
}

.icon-input > ion-input {
  justify-self: stretch;
  align-self: end;
  grid-area: input;

  border-bottom: 1px solid white;
  text-align: start;
}

</style>
