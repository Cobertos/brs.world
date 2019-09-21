<template>
  <div class="brs-container">
    <BRSViewer :brsBuff="brsBuff" />
    <input type="file"
      @change="onFileChange($event)"
      @click="onEntryClick($event)"/>
    <div class="entry"
      @click="onEntryClick($event)">Cloudy's Deathrun</div>
  </div>
</template>

<script>
import { noObserve } from '../utils.js';
import BRSViewer from './BRSViewer.vue';

export default {
  name: 'BRSUI',
  components: {
    BRSViewer
  },
  data(){ 
    return {
      brsBuff: undefined
    }
  },
  methods:{
    async onFileChange(e){
      console.log(e);
      const file = e.target.files[0];
      if(!file) {
        return;
      }
      console.log("Start file convert...");
      this.brsBuff = await file.arrayBuffer();
    },
    async onEntryClick(e){
      console.log(e);
      if(e.target.tagName === "input") {
        return;
      }
      //Load the BRSHMesh
      console.log("Start download...");
      const brsObj = await fetch("https://s3.us-east-2.amazonaws.com/bepis.co/cloudysDeathrunRevivedv8.brs");
      this.brsBuff = await brsObj.arrayBuffer();
    }
  }
}
</script>

<style lang="scss">
input[type="file"], div.entry {
  position: absolute;
  color: white;
}
</style>