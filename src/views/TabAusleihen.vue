<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Meine Ausleihen</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ausleihen</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <rad-item v-for="item in ausleihen" :key="item" :rad="item.fahrrad">
          <p>{{ transformZeitEnde(item) }}</p>
          <ion-button fill="outline" v-if="item.bis.getTime() > new Date().getTime()"
                      @click="setModalStationOpen(true, item)">Zurückgeben</ion-button>
        </rad-item>

        <ion-label color="medium" class="list-hint">Keine weiteren Elemente</ion-label>
      </ion-list>
    </ion-content>

    <!-- Modal: Stations-Auswahl (bei Rückgabe) -->
    <ion-modal id="select-station" animated="true" :is-open="modalStationOpen">
      <ion-content>
        <ion-toolbar>
          <ion-title>Rückgabe-Station auswählen</ion-title>
          <ion-label v-if="auswahlAusleihe !== null">Rad-ID: {{ auswahlAusleihe.fahrrad.id }}</ion-label>
        </ion-toolbar>

        <ion-list>
          <ion-radio-group>
            <ion-item v-for="station in stationen" :key="station" @click="auswahlStation = station">
              <ion-radio :value="station.id"></ion-radio>
              <ion-label>{{ station.bezeichnung }}</ion-label>
            </ion-item>
          </ion-radio-group>
        </ion-list>

        <ion-button color="medium" @click="setModalStationOpen(false)">Abbrechen</ion-button>
        <ion-button color="primary" @click="beendeAusleihe()">Rückgabe bestätigen</ion-button>
      </ion-content>
    </ion-modal>

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
  IonListHeader,
  IonModal,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  loadingController
} from '@ionic/vue';
import RadIcon from "@/components/RadIcon.vue";
import Ausleihe from "@/model/ausleihe";
import BenutzerService from "@/services/benutzer-service";
import {container} from "tsyringe";
import Station from "@/model/station";
import StationenService from "@/services/stationen-service";
import {infoToast, retryToast} from "@/util/toasts";
import RadItem from "@/components/RadItem.vue";

// noinspection JSMethodCanBeStatic
@Options({
  name: 'TabAusleihen',
  components: {
    RadItem,
    RadIcon, IonList, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonLabel, IonButton, IonModal, IonRadioGroup, IonRadio, IonListHeader
  },
})
export default class TabAusleihen extends Vue {
  private benutzerService: BenutzerService = container.resolve(BenutzerService);
  private stationenService: StationenService = container.resolve(StationenService);

  private ausleihen: Ausleihe[] = []
  private stationen: Station[] = []
  private auswahlAusleihe: Ausleihe | null = null;
  private auswahlStation: Station | null = null;
  private modalStationOpen = false;

  public async mounted(): Promise<void> {
    await this.benutzerService.init();
    this.ladeAusleihen();
  }

  private ladeAusleihen() {
    this.benutzerService.getAusleihen()
        .then(a => this.ausleihen = a)
        .catch(e => {
          retryToast(
              () => this.ladeAusleihen(),
              `Fehler: ${e.message}`,
              "Abrufen der Ausleihen fehlgeschlagen"
          );
        });
  }

  /**
   * Steuert das Modal zum Abgabe-Station auswählen und wird aufgerufen, sobald der Anwender eine aktive
   * Ausleihe zurückgeben möchte. Falls noch nicht geschehen, ruft diese Funktion auch eine Liste von
   * Stationen vom Backend ab.
   *
   * @param open Neuer Zustand des Modals.
   * @param auswahl Ausgewählte {@link Ausleihe}-Instanz, optional.
   */
  private async setModalStationOpen(open: boolean, auswahl: Ausleihe | null = null) {
    this.modalStationOpen = open;
    this.auswahlAusleihe = open ? auswahl : null;
    this.auswahlStation = null;

    // Lade Liste von Station zum Auswählen, falls noch nicht geschehen
    if (this.stationen.length > 0 || !open) return;
    const loading = await loadingController.create({
      message: "Liste von Stationen abrufen...",
    });
    await loading.present();

    this.stationenService.getStationen()
        .then(s => this.stationen = s)
        .catch(async e => {
          await this.setModalStationOpen(false);
          await infoToast("Abrufen der Stationen fehlgeschlagen",
              `Fehler: ${e.message}`);
        })
        .finally(() => loading.dismiss());
  }

  /**
   * Wird aufgerufen, sobald der Anwender im "Zurückgeben"-Dialog eine Abgabe-Station ausgewählt
   * und bestätigt hat.
   */
  private async beendeAusleihe() {
    if (this.auswahlStation === null || this.auswahlAusleihe === null) return;

    const loading = await loadingController.create({message: "Rad zurückgeben..."});
    await loading.present();
    try {
      const res = await this.benutzerService.endeAusleihe(this.auswahlAusleihe.id, this.auswahlStation.id);
      this.ausleihen.forEach((a, i) => {
        if (a.id === res.id) this.ausleihen[i] = res;
      });
    } catch (e: any) {
      await infoToast("Rückgabe fehlgeschlagen", `Fehler: ${e.message}`);
    } finally {
      await loading.dismiss();
      await this.setModalStationOpen(false);
    }
  }

  private transformZeitEnde(a: Ausleihe) {
    if (a.bis.getTime() < new Date().getTime())
      return `Zurückgegeben am ${a.bis.toLocaleDateString()}`;
    else
      return `Rückgabe bis ${a.bis.toLocaleDateString()} um ${a.bis.toLocaleTimeString()}`;
  }

}
</script>

<style scoped>
.list-hint {
  /* TODO */
}
</style>
