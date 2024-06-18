<script setup>
import { ref } from "vue";
const selectedSize = ref("md");
</script>

<template>
  <vg-button :size="selectedSize" @tick="(e) => console.log(e)">Test2</vg-button>
  <select @change="(e)=>selectedSize=e.target.value">
    <option value="lg" :selected="selectedSize=='lg'">lg</option>
    <option value="md" :selected="selectedSize=='md'">md</option>
    <option value="sm" :selected="selectedSize=='sm'">sm</option>
  </select>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
