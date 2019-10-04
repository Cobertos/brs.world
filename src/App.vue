<template>
  <div id="app">
    <BRSUI />
  </div>
</template>

<script>
import BRSUI from './components/BRSUI.vue';

export default {
  name: 'app',
  components: {
    BRSUI
  }
};
</script>

<style lang="scss">
@import "scss/main.scss";
</style>
