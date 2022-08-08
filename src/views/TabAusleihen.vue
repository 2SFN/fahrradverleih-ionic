<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ausleihen</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ausleihen</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item v-for="item in ausleihen" :key="item" lines="full">
          <RadIcon :radtyp="item.fahrrad.typ" slot="start" class="rad-icon"></RadIcon>
          <div class="info-container">
            <h2>{{ item.fahrrad.typ.bezeichnung }}</h2>
            <p>Tarif: {{ transformTarif(item) }}</p>
            <p>ID: {{ item.id }}</p>
            <p>{{ transformZeitEnde(item) }}</p>
            <ion-button fill="outline">Zurückgeben</ion-button>
          </div>
        </ion-item>

        <ion-label color="medium" class="list-hint">Keine weiteren Elemente</ion-label>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  toastController
} from '@ionic/vue';
import RadIcon from "@/components/RadIcon.vue";
import Ausleihe from "@/model/ausleihe";
import BenutzerService from "@/services/benutzer-service";
import {container} from "tsyringe";

@Options({
  name: 'TabAusleihen',
  components: {RadIcon, IonList, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonLabel, IonButton},
})
export default class TabAusleihen extends Vue {
  private benutzerService: BenutzerService = container.resolve(BenutzerService);

  private ausleihen: Ausleihe[] = []

  public async mounted(): Promise<void> {
    await this.benutzerService.init();
    this.benutzerService.getAusleihen()
        .then(a => this.ausleihen = a)
        .catch(e => {
          toastController.create({
            header: "Abrufen der Ausleihen fehlgeschlagen",
            message: `Fehler: ${e.message}`,
            color: "warning",
            duration: 3000
          }).then(t => t.present());
        });
  }

  private transformTarif(a: Ausleihe) {
    return `${a.tarif.preis.betrag} ${a.tarif.preis.iso4217} für ${a.tarif.taktung} Stunden`;
  }

  private transformZeitEnde(a: Ausleihe) {
    console.log(a);
    if (a.bis.getTime() < new Date().getTime())
      return `Zurückgegeben am ${a.bis.toLocaleDateString()}`;
    else
      return `Rückgabe bis ${a.bis.toLocaleDateString()} um ${a.bis.toLocaleTimeString()}`;
  }

}
</script>

<style scoped>
.rad-icon {
  max-width: 7em;
  /* TODO: Restliches Styling */
}

.info-container {
  /* TODO */
}

.list-hint {
  /* TODO */
}
</style>
