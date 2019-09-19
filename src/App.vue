<template>
  <div id="app">
    <BRSViewer />
  </div>
</template>

<script>
import BRSViewer from './components/BRSViewer.vue'

export default {
  name: 'app',
  components: {
    BRSViewer
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
