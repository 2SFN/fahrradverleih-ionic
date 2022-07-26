<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profil</ion-title>
        </ion-toolbar>
      </ion-header>

      <icon-input label="Vorname" v-model:value="benutzer.vorname"
                  icon="assets/icon/ic_id_card.svg"></icon-input>

      <icon-input label="Nachname" v-model:value="benutzer.name"
                  icon=""></icon-input>

      <icon-input label="E-Mail Adresse" v-model:value="benutzer.email"
                  icon="assets/icon/ic_email.svg"></icon-input>

      <div class="action-container">
        <ion-icon src="assets/icon/ic_lock.svg" size="large" color="medium"></ion-icon>
        <ion-button expand="block" fill="outline" color="primary"
                    class="block-button">
          Anmeldung ändern
        </ion-button>
      </div>

      <icon-input label="Profil ID" v-model:value="benutzer.id" editable="false"
                  icon="assets/icon/ic_link.svg"></icon-input>
    </ion-content>

    <div slot="fixed" class="bb-container">
      <ion-button color="danger" expand="block" fill="outline" class="block-button" @click="logoutDialog()">
        Abmelden
      </ion-button>
      <ion-button color="primary" expand="block" @click="apply()" class="block-button" fill="outline">
        Änderungen übernehmen
      </ion-button>
    </div>

  </ion-page>
</template>

<script lang="ts">
import {
  alertController,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  toastController
} from '@ionic/vue';
import IconInput from "@/components/IconInput.vue";
import {Options, Vue} from "vue-class-component";
import Benutzer from "@/model/benutzer";
import {container} from "tsyringe";
import BenutzerService from "@/services/benutzer-service";
import Prefs from "@/util/prefs";

@Options({
  name: 'TabProfil',
  components: {
    IconInput, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonItem,
    IonIcon, IonButton, IonFooter
  }
})
export default class TabProfil extends Vue {
  private benutzerService = container.resolve(BenutzerService);

  private benutzer = new Benutzer();

  public async mounted(): Promise<void> {
    // Profilinformationen abrufen
    this.benutzerService.getBenutzer()
        .then(b => this.benutzer = b)
        .catch(e => {
          toastController.create({
            header: "Abrufen der Profildaten fehlgeschlagen",
            message: `Fehler: ${e.message}`,
            color: "warning",
            duration: 3000
          }).then(t => t.present());
        });
  }

  public async apply(): Promise<void> {
    await this.benutzerService.setBenutzer(this.benutzer);
    toastController.create({
      header: "Daten gespeichert!",
      color: "success",
      duration: 3000
    }).then(t => t.present());
  }

  private async logoutDialog() {
    await (await alertController.create({
      header: "Abmelden bestätigen",
      message: "Sie können sich später wieder mit Ihren Zugangsdaten anmelden.",
      buttons: [
        {
          text: "Abbrechen",
          role: "cancel"
        },
        {
          text: "Abmelden",
          role: "confirm",
          handler: async () => {
            // Token löschen und auf Startseite weiterleiten
            await container.resolve(Prefs).remove(Prefs.KEY_TOKEN);
            this.$router.push("/");
          }
        }
      ]
    })).present();
  }

}
</script>

<style scoped>
ion-content {
  --padding-start: 1em;
  --padding-end: 1em;
  --padding-top: 1em;
}

.action-container {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  gap: 0 .8em;
  grid-template-areas: "icon action";

  margin-bottom: 1em;
}

.action-container > ion-icon {
  grid-area: icon;
  align-self: center;
  justify-self: start;
}

.action-container > ion-button {
  grid-area: action;
  align-self: end;
  justify-self: stretch;

  margin: 4px 0;
  --padding-top: 4px;
  --padding-bottom: 4px;
}
</style>
