<template>
  <ion-page>
    <ion-content class="brand-bg">
      <div class="startup-header">
        <ion-img src="assets/icon/monheim.svg" class="ic"/>
        <p>Fahrradverleih</p>
        <p>Monheim am Rhein</p>
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
          <!-- TODO: Icons & Style -->
          <ion-input id="login-mail" type="email" placeholder="E-Mail Adresse" v-model="loginMail"></ion-input>
          <ion-input id="login-pass" type="password" placeholder="Passwort" v-model="loginPass"></ion-input>
          <ion-button fill="outline" @click="login()">Anmelden</ion-button>
        </div>

        <!-- Registrierung -->
        <div id="register" v-show="state === 'register'">
          <ion-title>Registrieren</ion-title>
          <!-- Funktion im Rahmen des Projektes nicht implementiert -->
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
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
    IonSpinner, IonInput
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
    this.navigate();
  }

  private navigate(path = this.$route.path) {
    // Zustand aus Path wiederherstellen
    switch (path) {
      default:
      case '/':
      case '/auth':
        this.state = StartupScreen.STATE_AUTH;
        // TODO: Debug statement
        // await this.auth();
        setTimeout(() => this.auth(), 3333);
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

    // Versuche Authentifizierung am Backend/Service
    this.benutzerService.auth('', '')
        .then(() => this.$router.push("/tabs"))
        .catch(e => {
          // Lösche ungültiges Token
          this.prefs.set(Prefs.KEY_TOKEN, "");

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

    this.benutzerService.auth(this.loginMail, this.loginPass)
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
  --background: white url('../../public/assets/picture/startup.webp') no-repeat center top fixed;
  background-size: cover;
}

.startup-header {
  background: rgba(2, 151, 220, 0.71);
  color: white;
  height: 7em;
}

.startup-header > .ic {
  height: 6em;
}

.startup-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);

  text-align: center;

  background: rgba(255, 255, 255, 0.56);
  border: white 0;
  border-radius: 2em;

  padding: 1em;
  margin: 2em;
}

#auth > p {
  color: white;
}

</style>
