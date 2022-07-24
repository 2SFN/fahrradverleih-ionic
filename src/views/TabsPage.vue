<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon src="assets/icon/ic_home.svg" />
          <ion-label>Suchen</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="ausleihen" href="/tabs/ausleihen">
          <ion-icon src="assets/icon/ic_bicycle.svg" />
          <ion-label>Ausleihen</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="profil" href="/tabs/profil">
          <ion-icon src="assets/icon/ic_account.svg" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';

export default defineComponent({
  name: 'TabsPage',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
  setup() {
    return {}
  }
});
</script>
