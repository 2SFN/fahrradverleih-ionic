<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Stationen Suchen</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Stationen Suchen</ion-title>
        </ion-toolbar>
      </ion-header>
      <MapContainer />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import MapContainer from "@/components/MapContainer.vue";

export default  defineComponent({
  name: 'StationsMap',
  components: {MapContainer, IonHeader, IonToolbar, IonTitle, IonContent, IonPage }
});
</script>
