<template>
  <ion-item>
    <ion-icon :src="icon" slot="start" color="medium" size="large"></ion-icon>
    <ion-label color="medium" position="top">{{label}}</ion-label>
    <ion-input v-on:input="handleInput($event.target.value)" :value="value" :type="type"
      color="medium" :readonly="!editable"></ion-input>
  </ion-item>
</template>

<script lang="ts">

import {Options, Vue, prop} from "vue-class-component";
import {IonIcon, IonInput, IonItem, IonLabel} from "@ionic/vue";

/**
 * Klasse, die Properties (props) für dieses Vue-Component hält.
 *
 * Wird verwendet mit {@code class ... extends Vue.with(...)}.
 */
class IconInputProps {
  label = prop<string>({ default: '' });
  type = prop<string>({default: 'text' });
  icon = prop<string>({ default: '' });
  value = prop<string>({ default: '' });
  editable = prop<boolean>({ default: true });
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

</style>