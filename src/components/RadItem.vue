<template>
  <ion-item lines="full" @click="$emit('click', $event)">
    <RadIcon :radtyp="getRad().typ" class="rad-icon" slot="start"></RadIcon>
    <div class="info-container">
      <h2>{{ getRad().typ.bezeichnung }}</h2>
      <p>Tarif: {{ transformTarif(getRad().typ.tarif) }}</p>
      <p>ID: {{ getRad().id }}</p>
      <slot></slot>
    </div>
  </ion-item>
</template>

<script lang="ts">
import {Options, prop, Vue} from "vue-class-component";
import Fahrrad from "@/model/fahrrad";
import {IonItem} from "@ionic/vue";
import RadIcon from "@/components/RadIcon.vue";
import TarifT from "@/model/tarif";

export class RadItemProps {
  rad = prop<Fahrrad>({required: true});
}

// noinspection JSMethodCanBeStatic
/**
 * Vue-Component, welches ein {@link Fahrrad}-Item anzeigt (für die Verwendung in Listen).
 * Kann durch füllen des slots erweitert werden (zusätzliche Labels, Buttons, etc.).
 *
 * Basiert auf {@link IonItem}.
 */
@Options({
  components: {
    RadIcon,
    IonItem
  }
})
export default class RadItem extends Vue.with(RadItemProps) {

  // public async mounted() {}

  public getRad(): Fahrrad {
    return this.rad;
  }

  private transformTarif(t: TarifT) {
    return `${t.preis.betrag} ${t.preis.iso4217} für ${t.taktung} Stunden`;
  }

}
</script>

<style scoped>
.rad-icon {
  max-width: 7em;
}

.info-container {
  padding-top: .5em;
  padding-bottom: .5em;
}

.info-container > h2 {
  font-size: medium;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: 6px;
}

/* v-deep: Style auch auf untergeordnete nodes außerhalb des scopes anwenden, i.e. slots */
.info-container::v-deep(p) {
  font-size: medium;
  font-weight: lighter;
  margin-top: 4px;
  margin-bottom: 2px;
}

</style>