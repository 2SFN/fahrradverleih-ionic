<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Stationen Suchen</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div id="gmap" slot="fixed"></div>
    </ion-content>

    <!-- Modal: Fahrrad-Auswahl (nach Auswahl einer Station) -->
    <ion-modal id="modal-rad" animated="true" :is-open="modalRadListeOpen">
      <ion-content>
        <ion-toolbar color="primary">
          <!-- //TODO: Icon (s. Mockups) -->
          <ion-title v-if="auswahlStation !== null">{{ auswahlStation.bezeichnung }}</ion-title>
          <p>Fahrrad auswählen</p>
        </ion-toolbar>

        <ion-list>
          <rad-item v-for="rad in raeder" :key="rad" :rad="rad"
                    @click="setModalAusleiheOpen(true, rad)"></rad-item>
          <ion-label color="medium" class="list-hint">Keine weiteren Elemente</ion-label>
        </ion-list>

        <div class="bottom-buttons-container" slot="fixed">
          <ion-button color="medium" fill="outline"
                      @click="setModalRadListeOpen(false)">Zurück
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal: Ausleihe vorbereiten (nach Auswahl eines Fahrrads) -->
    <ion-modal id="modal-ausleihe" animated="true" :is-open="modalAusleiheOpen">
      <ion-content>
        <ion-toolbar color="primary">
          <!-- //TODO: Icon (s. Mockups) -->
          <ion-title v-if="auswahlStation !== null">{{ auswahlStation.bezeichnung }}</ion-title>
          <p>Fahrrad buchen</p>
        </ion-toolbar>

        <rad-item v-if="auswahlRad !== null" :rad="auswahlRad"></rad-item>

        <div class="time-container">
          <p>Rad ausleihen für</p>
          <div class="time-value">
            <h2>{{ auswahlDauer }}</h2>
            <p>h</p>
          </div>
          <p v-if="auswahlRad !== null">
            Gesamtpreis:
            {{ (auswahlDauer / auswahlRad.typ.tarif.taktung) * auswahlRad.typ.tarif.preis.betrag }}
            {{ auswahlRad.typ.tarif.preis.iso4217 }}
          </p>
          <p v-if="auswahlRad !== null">
            Rückgabe bis {{ nowPlusHours(auswahlDauer).toLocaleTimeString() }}
          </p>

          <div class="time-buttons">
            <ion-button @click="dauerAnpassen(false)" aria-label="Dauer verringern"
                        fill="outline">-
            </ion-button>
            <ion-button @click="dauerAnpassen(true)" aria-label="Dauer erhöhen"
                        fill="outline">+
            </ion-button>
          </div>
        </div>

        <div class="bottom-buttons-container" slot="fixed">
          <ion-button color="primary" fill="outline"
                      @click="beginneAusleihe()">Buchung Bestätigen</ion-button>
          <ion-button color="medium" fill="outline"
                      @click="setModalAusleiheOpen(false)">Zurück
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

  </ion-page>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import {
  IonContent, IonHeader, IonModal, IonPage, IonTitle, IonToolbar, IonButton, IonList,
  loadingController, IonItem, IonLabel
} from '@ionic/vue';
import BenutzerService from "@/services/benutzer-service";
import {container} from "tsyringe";
import StationenService from "@/services/stationen-service";
import Station from "@/model/station";
import Fahrrad from "@/model/fahrrad";
import {actionToast, infoToast, retryToast} from "@/util/toasts";
import {Loader} from "@googlemaps/js-api-loader";
import RadIcon from "@/components/RadIcon.vue";
import RadItem from "@/components/RadItem.vue";

// noinspection JSMethodCanBeStatic
@Options({
  components: {
    RadItem,
    RadIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonModal, IonButton,
    IonList, IonItem, IonLabel
  }
})
export default class TabMap extends Vue {
  private static readonly DAUER_MIN = 1;
  private static readonly DAUER_MAX = 48;

  private benutzerService: BenutzerService = container.resolve(BenutzerService);
  private stationenService: StationenService = container.resolve(StationenService);

  private stationen: Station[] = []
  private auswahlStation: Station | null = null;
  private raeder: Fahrrad[] = []
  private auswahlRad: Fahrrad | null = null;
  private modalRadListeOpen = false;
  private modalAusleiheOpen = false;
  private auswahlDauer = 0;

  private mapLoader = new Loader({
    apiKey: process.env.VUE_APP_MAPS_API_KEY,
    language: "de",
    region: "DE"
  });

  public async mounted(): Promise<void> {
    await this.stationenService.init();
    this.ladeStationen();
  }

  /**
   * Konfiguriert den Google Maps Container.
   * Generiert außerdem einen Marker mit entsprechendem Click-Event für jede Station.
   */
  private prepareMaps() {
    const mapOptions = {
      center: {
        lat: 51.102129,
        lng: 6.892598
      },
      zoom: 14,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      minZoom: 10,
      styles: [
        {
          featureType: "poi.business",
          stylers: [
            {
              visibility: "off"
            }
          ]
        }
      ]
    }

    this.mapLoader.load()
        .then(google => {
          const mapDiv = document.getElementById("gmap");
          if (mapDiv === null) return;
          const map = new google.maps.Map(mapDiv, mapOptions);

          // Marker für Stationen generieren
          this.stationen.forEach(s => {
            const marker = new google.maps.Marker({
              map: map,
              position: {
                lat: s.position.breite,
                lng: s.position.laenge
              },
              clickable: true,
              draggable: false,
              title: s.bezeichnung
            });
            marker.addListener("click", async () => {
              // TODO: Modal mit Fahrrad-Kategorien, anstatt direkt Liste von Rädern?
              await this.setModalRadListeOpen(true, s);
            });
          });
        });
  }

  /**
   * Steuert das Modal zur Fahrrad-Auswahl. Erfordert zum Öffnen die vorherige Auswahl einer
   * bestimmten Station.
   *
   * @param open Neuer Zustand des Modals.
   * @param station Ausgewählte {@link Station} (wenn offen).
   * @param filter Typen-Filter, optional.
   */
  private async setModalRadListeOpen(open: boolean, station: Station | null = null,
                                     filter: string | null = null) {
    this.modalRadListeOpen = open;
    this.auswahlStation = open ? station : null;
    if (!open) this.raeder = [];

    // Lade liste von Rädern, falls noch nicht geschehen (und offen)
    if (this.raeder.length > 0 || !open || station === null) return;
    const loading = await loadingController.create({message: "Liste von Fahrrädern abrufen..."});
    await loading.present();

    this.stationenService.getRaeder(station.id)
        .then(r => r.filter(f => f.typ.bezeichnung === filter || filter === null))
        .then(r => this.raeder = r)
        .catch(async e => {
          await this.setModalRadListeOpen(false);
          await infoToast("Abrufen der Fahrräder fehlgeschlagen", `Fehler: ${e.message}`);
        })
        .finally(() => loading.dismiss());
  }

  /**
   * Steuert das Modal zur Ausleihe. Erfordert, dass vor dem Öffnen ein Fahrrad ausgewählt
   * wurde.
   *
   * @param open Neuer Zustand des Modals.
   * @param rad Ausgewähltes {@link Fahrrad} (wenn offen).
   */
  private async setModalAusleiheOpen(open: boolean, rad: Fahrrad | null = null) {
    this.modalAusleiheOpen = open;
    this.auswahlRad = open ? rad : null;
    if (open && rad !== null) this.auswahlDauer = rad.typ.tarif.taktung;
  }

  /**
   * Beginnt eine neue Ausleihe. Verwendet hierzu das zuvor ausgewählte Fahrrad und
   * die eingestellte Zeit in {@link auswahlDauer}.
   */
  private async beginneAusleihe() {
    if (this.auswahlRad === null || this.auswahlDauer < TabMap.DAUER_MIN) return;

    const loading = await loadingController.create({message: "Rad buchen..."});
    await loading.present();

    this.benutzerService.neueAusleihe(this.auswahlRad.id, new Date(),
        this.nowPlusHours(this.auswahlDauer))
    .then(async () => {
      await this.setModalAusleiheOpen(false);
      await this.setModalRadListeOpen(false);
      await actionToast(
          () => this.$router.push("/tabs/ausleihen"),
          "Ansehen", "Ausleihe erfolgreich",
          "Details zur Ausleihe befinden sich im 'Ausleihen'-Tab.",
          "success"
      );
    })
    .catch(e => infoToast("Etwas ist schiefgelaufen",
        `Fehler: ${e.message}`))
    .finally(() => loading.dismiss());
  }

  /**
   * Holt die Liste von verfügbaren Stationen ab, und ruft danach (sofern erfolgreich) die
   * {@link prepareMaps()}-Methode auf, welche von diesen Daten abhängig ist.
   */
  private ladeStationen() {
    this.stationenService.getStationen()
        .then(s => {
          this.stationen = s;
          this.prepareMaps();
        })
        .catch(e => retryToast(
            () => this.ladeStationen(),
            "Laden der Stationen fehlgeschlagen",
            `Fehler: ${e.message}`
        ));
  }

  /**
   * Helfer-Funktion, welche die ausgewählte Dauer der Ausleihe stufenweise entsprechend der
   * Taktung des Tarifs anpasst. Erlaubt dabei nur Werte in einem vordefinierten Bereich.
   *
   * @param plus Ob der Wert inkrementiert (true) oder dekrementiert (false) werden soll.
   */
  private dauerAnpassen(plus: boolean) {
    if (this.auswahlRad === null) return;
    const taktung = this.auswahlRad.typ.tarif.taktung;
    const val = plus ? (this.auswahlDauer + taktung) : (this.auswahlDauer - taktung);
    if (val >= TabMap.DAUER_MIN && val <= TabMap.DAUER_MAX) this.auswahlDauer = val;
  }

  private nowPlusHours(h: number): Date {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + h);
    return date;
  }

}
</script>

<style scoped>
#gmap {
  width: 100%;
  height: 100%;
}

.bottom-buttons-container {
  bottom: .5em;
  /* TODO: Further styling */
}

.list-hint {
  /* TODO: Center + Styling */
}
</style>
