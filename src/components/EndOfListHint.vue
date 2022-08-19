<template>
  <div class="list-hint">
    <p>{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {prop, Vue} from "vue-class-component";
import "@/theme/variables.css";

export class EndOfListHintProps {
  static readonly DEFAULT_MESSAGE = "Keine weiteren Elemente";
  message = prop<string>({required: false, default: EndOfListHintProps.DEFAULT_MESSAGE});
}

export default class EndOfListHint extends Vue.with(EndOfListHintProps) {

}

</script>

<style scoped>
.list-hint {
  color: var(--ion-color-medium, grey);
  text-align: center;
  font-weight: lighter;
  font-size: medium;
  margin: 2em 2em;
}
</style>