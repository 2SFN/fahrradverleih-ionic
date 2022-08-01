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

      <ion-item>
        <ion-icon src="assets/icon/ic_lock.svg" size="large" color="medium" slot="start"></ion-icon>
        <ion-button expand="block" fill="outline" color="primary">Anmeldung ändern</ion-button>
      </ion-item>

      <icon-input label="Profil ID" v-model:value="benutzer.id" editable="false"
                  icon="assets/icon/ic_link.svg"></icon-input>
    </ion-content>

    <ion-footer>
      <ion-button color="primary" expand="block" fill="outline">Änderungen übernehmen</ion-button>
    </ion-footer>

  </ion-page>
</template>

<script lang="ts">
import {IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import IconInput from "@/components/IconInput.vue";
import {Options, Vue} from "vue-class-component";
import Benutzer from "@/model/benutzer";

@Options({
  name: 'TabProfil',
  components: {IconInput, IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonItem,
    IonIcon, IonButton, IonFooter}
})
export default class TabProfil extends Vue {
  private benutzer = new Benutzer();


}
</script>
