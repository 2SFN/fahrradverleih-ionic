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

    <!-- Modal: Kategorie-Auswahl (nach Auswahl einer Station) -->
    <ion-modal id="modal-kategorie" animated="true" :is-open="modalKategorieOpen">
      <ion-content>
        <ion-toolbar color="primary">
          <ion-icon src="assets/icon/ic_map_marker.svg" slot="start" class="marker-icon"></ion-icon>
          <div v-if="auswahlStation !== null" class="title-container">
            <h2>{{ auswahlStation.bezeichnung }}</h2>
            <p>Radtyp auswählen</p>
          </div>
        </ion-toolbar>

        <ion-list>
          <ion-item v-for="typ in anzahlProTyp.keys()" :key="typ" lines="full" class="category-item">
            <rad-icon :radtyp="typ" class="rad-icon" slot="start"></rad-icon>
            <div class="info-container">
              <h2>{{ typ }}</h2>
              <p>Verfügbar: {{ anzahlProTyp.get(typ) }}</p>
              <ion-button fill="outline" @click="setModalRadListeOpen(true, auswahlStation, typ)"
                          class="block-button bb-primary" expand="block">
                Auswählen
              </ion-button>
            </div>
          </ion-item>

          <end-of-list-hint></end-of-list-hint>
        </ion-list>

        <div class="bottom-buttons-container" slot="fixed">
          <ion-button color="medium" fill="outline" @click="setModalKategorieOpen(false)"
                      expand="block" class="block-button bb-medium">Zurück
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal: Fahrrad-Auswahl (nach Auswahl eines Rad-Typs) -->
    <ion-modal id="modal-rad" animated="true" :is-open="modalRadListeOpen">
      <ion-content>
        <ion-toolbar color="primary">
          <ion-icon src="assets/icon/ic_map_marker.svg" slot="start" class="marker-icon"></ion-icon>
          <div v-if="auswahlStation !== null" class="title-container">
            <h2>{{ auswahlStation.bezeichnung }}</h2>
            <p>Fahrrad auswählen</p>
          </div>
        </ion-toolbar>

        <ion-list>
          <rad-item v-for="rad in raeder" :key="rad" :rad="rad">
            <ion-button expand="block" class="block-button bb-primary" fill="outline">
              Für Später Reservieren
            </ion-button>
            <ion-button expand="block" class="block-button bb-primary" fill="outline"
                        @click="setModalAusleiheOpen(true, rad)">
              Jetzt Buchen
            </ion-button>
          </rad-item>
          <end-of-list-hint></end-of-list-hint>
        </ion-list>

        <div class="bottom-buttons-container" slot="fixed">
          <ion-button class="block-button bb-medium" expand="block" fill="outline"
                      @click="setModalRadListeOpen(false)">Zurück
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal: Ausleihe vorbereiten (nach Auswahl eines Fahrrads) -->
    <ion-modal id="modal-ausleihe" animated="true" :is-open="modalAusleiheOpen">
      <ion-content>
        <ion-toolbar color="primary">
          <ion-icon src="assets/icon/ic_map_marker.svg" slot="start" class="marker-icon"></ion-icon>
          <div v-if="auswahlStation !== null" class="title-container">
            <h2>{{ auswahlStation.bezeichnung }}</h2>
            <p>Fahrrad buchen</p>
          </div>
        </ion-toolbar>

        <rad-item v-if="auswahlRad !== null" :rad="auswahlRad"></rad-item>

        <div class="time-container">
          <p class="header">Rad ausleihen für</p>
          <p class="time">{{ auswahlDauer }}</p>
          <p class="unit">h</p>
          <div class="info" v-if="auswahlRad !== null">
            <p>
              Gesamtpreis:
              {{ (auswahlDauer / auswahlRad.typ.tarif.taktung) * auswahlRad.typ.tarif.preis.betrag }}
              {{ auswahlRad.typ.tarif.preis.iso4217 }}
            </p>
            <p>Rückgabe bis {{ nowPlusHours(auswahlDauer).toLocaleTimeString() }}</p>
          </div>

          <ion-button @click="dauerAnpassen(false)" aria-label="Dauer verringern"
                      fill="outline" class="minus block-button bb-primary">−
          </ion-button>
          <ion-button @click="dauerAnpassen(true)" aria-label="Dauer erhöhen"
                      fill="outline" class="plus block-button bb-primary">+
          </ion-button>
        </div>

        <div class="bottom-buttons-container" slot="fixed">
          <ion-button color="primary" fill="outline" expand="block" class="block-button bb-primary"
                      @click="beginneAusleihe()">Buchung Bestätigen
          </ion-button>
          <ion-button color="medium" fill="outline" expand="block" class="block-button bb-medium"
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
  IonButton,
  IonContent,
  IonHeader, IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  loadingController
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
import EndOfListHint from "@/components/EndOfListHint.vue";
import "@/theme/buttons.css";

// noinspection JSMethodCanBeStatic
@Options({
  components: {
    EndOfListHint,
    RadItem,
    RadIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonModal, IonButton,
    IonList, IonItem, IonLabel, IonIcon
  }
})
export default class TabMap extends Vue {
  private static readonly DAUER_MIN = 1;
  private static readonly DAUER_MAX = 48;

  private benutzerService: BenutzerService = container.resolve(BenutzerService);
  private stationenService: StationenService = container.resolve(StationenService);

  private stationen: Station[] = []
  private raeder: Fahrrad[] = []
  private anzahlProTyp = new Map<string, number>();
  private auswahlStation: Station | null = null;
  private auswahlRad: Fahrrad | null = null;
  private auswahlDauer = 0;

  private modalRadListeOpen = false;
  private modalAusleiheOpen = false;
  private modalKategorieOpen = false;

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
        {featureType: 'administrative.country', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'administrative.land_parcel', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{visibility: 'off'}]},
        {featureType: 'administrative.locality', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'administrative.neighborhood', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'administrative.province', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{color: '#e0e0e0'}]},
        {featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'landscape.natural.landcover', elementType: 'geometry.fill', stylers: [{color: '#858585'}]},
        {featureType: 'landscape.natural.terrain', elementType: 'geometry.fill', stylers: [{color: '#a6cb84'}]},
        {featureType: 'poi.attraction', elementType: 'geometry.fill', stylers: [{color: '#71af3e'}]},
        {featureType: 'poi.attraction', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.business', stylers: [{visibility: 'off'}]},
        {featureType: 'poi.business', elementType: 'geometry.fill', stylers: [{color: '#c4c4c4'}]},
        {featureType: 'poi.business', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.government', elementType: 'geometry.fill', stylers: [{color: '#9c9c9c'}]},
        {featureType: 'poi.government', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.medical', elementType: 'geometry.fill', stylers: [{color: '#0da4de'}]},
        {featureType: 'poi.medical', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{color: '#71af3e'}]},
        {featureType: 'poi.park', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.park', elementType: 'labels.text', stylers: [{visibility: 'off'}]},
        {featureType: 'poi.place_of_worship', elementType: 'geometry.fill', stylers: [{color: '#0da4de'}]},
        {featureType: 'poi.place_of_worship', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.place_of_worship', elementType: 'labels.text.fill', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.school', elementType: 'geometry.fill', stylers: [{color: '#d1d1d1'}]},
        {featureType: 'poi.school', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.school', elementType: 'labels.text.fill', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.sports_complex', elementType: 'geometry.fill', stylers: [{color: '#71af3e'}]},
        {featureType: 'poi.sports_complex', elementType: 'labels.icon', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'poi.sports_complex', elementType: 'labels.text.fill', stylers: [{color: '#6b6b6b'}]},
        {featureType: 'road.local', elementType: 'geometry.fill', stylers: [{color: '#ffffff'}]},
        {featureType: 'road.local', elementType: 'labels', stylers: [{visibility: 'off'}]},
        {featureType: 'water', elementType: 'geometry.stroke', stylers: [{visibility: 'off'}]},
        {featureType: 'water', elementType: 'labels.text', stylers: [{color: '#ffffff'}]},
      ]
    }

    // Eigenes Vektoricon für Marker, docs:
    // https://developers.google.com/maps/documentation/javascript/reference/marker#Symbol
    const markerIconPath = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
    const iconAnchor = {x: 12, y: 17};
    const iconLabelOrigin = {x: 12, y: 9};
    const markerIcon = {
      path: markerIconPath,
      anchor: iconAnchor,
      fillColor: "#0297DC",
      fillOpacity: 1,
      labelOrigin: iconLabelOrigin,
      strokeColor: "white",
      strokeWeight: 2,
      scale: 2
    };

    this.mapLoader.load()
        .then(google => {
          const mapDiv = document.getElementById("gmap");
          if (mapDiv === null) return;
          const map = new google.maps.Map(mapDiv, mapOptions);

          // Marker für Stationen generieren
          this.stationen.forEach(s => {
            const marker = new google.maps.Marker({
              map: map,
              icon: markerIcon as google.maps.Symbol,
              position: {lat: s.position.breite, lng: s.position.laenge},
              clickable: true, draggable: false,
              title: s.bezeichnung,
              label: {
                text: String(s.verfuegbar),
                fontWeight: "bold",
                color: "white"
              }
            });
            marker.addListener("click", () => this.setModalKategorieOpen(true, s));
          });
        });
  }

  /**
   * Steuert das Modal zur Fahrrad-Auswahl. Erfordert zum Öffnen die vorherige Auswahl einer
   * bestimmten Station. Filtert die Liste nach einer bestimmten Typenbezeichnung (optional).
   *
   * @param open Neuer Zustand des Modals.
   * @param station Ausgewählte {@link Station} (wenn offen).
   * @param filter Typen-Filter, optional.
   */
  private async setModalRadListeOpen(open: boolean, station: Station | null = null,
                                     filter: string | null = null) {
    this.modalRadListeOpen = open;
    this.auswahlStation = station;

    if (this.raeder.length > 0 && filter !== null)
      this.raeder = this.raeder.filter(r => r.typ.bezeichnung === filter);
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
   * Steuert das Modal zur Fahrradtypen-Auswahl. Ruft dazu die Liste von verfügbaren Rädern
   * zu der zuvor ausgewählten Station ab.
   *
   * @param open Neuer Zustand des Modals.
   * @param station Ausgewählte Station.
   */
  private async setModalKategorieOpen(open: boolean, station: Station | null = null) {
    this.modalKategorieOpen = open;
    this.auswahlStation = station;
    if (!open) this.raeder = [];

    // Lade Liste von Rädern
    if (!open || station === null) return;
    loadingController.create({message: "Liste von Fahrrädern abrufen..."})
        .then(loading => loading.present())
        .then(() => this.stationenService.getRaeder(station.id))
        .then(r => this.raeder = r)
        .then(r => {
          // Zähle die Anzahl von Rädern pro Typenbezeichnung
          this.anzahlProTyp.clear();
          for (const c of r)
            this.anzahlProTyp.set(c.typ.bezeichnung, (this.anzahlProTyp.get(c.typ.bezeichnung) || 0) + 1);
        })
        .catch(async e => {
          await this.setModalKategorieOpen(false);
          await infoToast("Abrufen der Fahrräder fehlgeschlagen", `Fehler: ${e.message}`);
        })
        .finally(() => loadingController.dismiss());
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
          await this.setModalKategorieOpen(false);
          await actionToast(
              () => this.$router.push({path: "/tabs/ausleihen", query: {refresh: "yes"}}),
              "Ansehen", "Ausleihe erfolgreich",
              "Details zur Ausleihe befinden sich im 'Ausleihen'-Tab.",
              "success", 3000
          );
        })
        .then(() => this.ladeStationen())
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
  width: 100%;
  bottom: .5em;

  padding: 0 .5em;
}

.rad-icon {
  width: 7.5em;
}

.category-item {
  --padding-bottom: .5em;
  --padding-top: .5em;
}

.marker-icon {
  width: 2.5em;
  height: 2.5em;
}

.info-container {
  justify-self: stretch;
  width: 100%;

  padding-top: .5em;
  padding-bottom: .5em;
}

.info-container > h2 {
  font-size: medium;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: 6px;
}

.info-container > p {
  font-size: medium;
  font-weight: lighter;
  margin-top: .3em;
  margin-bottom: .6em;
}

.title-container {
  margin-left: .5em;
  margin-right: .5em;
}

.title-container > h2 {
  font-weight: lighter;
  font-size: large;
  margin-top: 4px;
  margin-bottom: 4px
}

.title-container > p {
  font-weight: lighter;
  font-size: small;
  margin-top: 4px;
  margin-bottom: 4px
}

.time-container {
  text-align: center;
}

.time-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto auto;
  gap: 1.5em 1em;
  grid-template-areas:
    "header header"
    "time unit"
    "info info"
    "minus plus";
  justify-content: center;
  align-content: start;
  justify-items: stretch;
  align-items: start;

  margin: 3em 1em;
}

.time-container p {
  margin: 0;

  font-weight: lighter;
  font-size: medium;
  line-height: 1.3;
}

.time-container > .header {
  grid-area: header;
}

.time-container > .time {
  grid-area: time;
  justify-self: end;

  font-size: xxx-large;
  font-weight: bold;
}

.time-container > .unit {
  grid-area: unit;
  justify-self: start;

  font-size: xxx-large;
  font-weight: lighter;
  color: var(--ion-color-medium, grey);
}

.time-container > .info {
  grid-area: info;
}

.time-container > .minus {
  grid-area: minus;
}

.time-container > .plus {
  grid-area: plus;
}

</style>
