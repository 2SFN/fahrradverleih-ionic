<template>
  <div class="icon-input">
    <ion-icon :src="icon" color="medium" size="large"></ion-icon>
    <ion-label color="medium">{{ label }}</ion-label>
    <ion-input v-on:input="handleInput($event.target.value)" :value="value" :type="type"
               color="medium" :readonly="!editable"></ion-input>
  </div>
</template>

<script lang="ts">

import {Options, prop, Vue} from "vue-class-component";
import {IonIcon, IonInput, IonItem, IonLabel} from "@ionic/vue";

/**
 * Klasse, die Properties (props) für dieses Vue-Component hält.
 *
 * Wird verwendet mit {@code class ... extends Vue.with(...)}.
 */
export class IconInputProps {
  label = prop<string>({default: ''});
  type = prop<string>({default: 'text'});
  icon = prop<string>({default: ''});
  value = prop<string>({default: ''});
  editable = prop<boolean>({default: true});
}

/**
 * Vue-Component, welches ein Eingabefeld mit Icon darstellt.
 *
 * Unterstützt two-way-bindings (v-model) für das {@code value}-Property.
 * (s. https://vuejs.org/guide/components/events.html#usage-with-v-model)
 */
@Options({
  components: {
    IonItem, IonIcon, IonLabel, IonInput
  }
})
export default class IconInput extends Vue.with(IconInputProps) {

  // public async mounted(): Promise<void> {}

  private handleInput(value: string) {
    this.$emit("update:value", value);
  }

}
</script>

<style scoped>
.icon-input {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  gap: 0.1em .8em;
  grid-template-areas:
    "icon label"
    "icon input";

  margin-bottom: 1em;
}

.icon-input > ion-icon {
  justify-self: start;
  align-self: end;
  grid-area: icon;
}

.icon-input > ion-label {
  justify-self: start;
  align-self: end;
  grid-area: label;

  font-size: small;
  font-weight: lighter;
}

.icon-input > ion-input {
  justify-self: stretch;
  align-self: end;
  grid-area: input;

  --padding-top: 6px;
  --padding-bottom: 6px;

  border: 1px solid var(--ion-color-medium, grey);
  text-align: start;
}
</style>