<template>
  <ion-img :src="icon_src" alt></ion-img>
</template>

<script lang="ts">
import {Options, prop, Vue} from "vue-class-component";
import {IonIcon, IonImg} from "@ionic/vue";
import FahrradTyp from "@/model/fahrradtyp";
import TarifT from "@/model/tarif";

export class RadIconProps {
  static readonly DEFAULT_RADTYP = new FahrradTyp("Unbekannt", new TarifT());
  radtyp = prop<FahrradTyp | string>({default: RadIconProps.DEFAULT_RADTYP});
}

/**
 * Vue-Component, welches ein Rad-Icon basierend auf dem {@link FahrradTyp}
 * auswählt und anzeigt.
 */
@Options({
  components: {
    IonIcon, IonImg
  }
})
export default class RadIcon extends Vue.with(RadIconProps) {
  private icon_src = "";

  public async mounted(): Promise<void> {
    // Icon nach Rad-Bezeichnung/Typen auswählen
    switch (typeof this.radtyp === "string" ? this.radtyp : this.radtyp.bezeichnung) {
      case "City-Bike":
        this.icon_src = "assets/icon/rad/smart.svg";
        break;
      case "Jugendrad":
        this.icon_src = "assets/icon/rad/kids.svg";
        break;
      case "Lastenrad":
        this.icon_src = "assets/icon/rad/cargo.svg";
        break;
      case "E-Bike":
        this.icon_src = "assets/icon/rad/ebike.svg";
        break;
      default:
        this.icon_src = "assets/icon/ic_help_outline.svg";
        break;
    }
  }
}
</script>

<style scoped>

</style>