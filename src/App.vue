<template>
  <div id="app">
    <BRSUI />
  </div>
</template>

<script>
import BRSUI from './components/BRSUI.vue'

export default {
  name: 'app',
  components: {
    BRSUI
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
