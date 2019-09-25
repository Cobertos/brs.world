<template>
  <div class="brs-container">
    <BRSViewer :brsBuff="brsBuff" />
    <div class="brs-main">
      <div class="brs-list">
        <div class="brs-list-item">
          <input type="file"
            @change="onFileChange($event)" />
        </div>
        <div class="brs-list-item"
          v-for="brsInfo in brsInfoList"
          :key="brsInfo.url"
          @click="onEntryClick($event, brsInfo.url)">
          <h2>{{brsInfo.map}}</h2>
          <p>{{brsInfo.author.name}}</p>
          <p>{{brsInfo.description}}</p>
        </div>
      </div>
    </div>
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
      brsBuff: undefined,
      brsInfoList: [{
        map: "Bowling Alley",
        author: {id: "xxx", name: "Cobertos"},
        description: "Bowling alley I made a long time back but it held up pretty well",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/BowlingAlleyUpdatev0.3.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Valley TDM",
        author: {id: "xxx", name: "Cobertos"},
        description: "A large TDM set in a valley with may interactable elements and easter eggs",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/ValleyTDMFINALFINAL1.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Balloonist's Build Royale",
        author: {id: "xxx", name: "Cobertos"},
        description: "Islands featured in the Blockland trailer for an unfinished gamemode",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/BBRMinimal8.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "de_cbble2",
        author: {id: "xxx", name: "Cobertos"},
        description: "Half of de_cbble2 from Counter Strike 1.6",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/de_cbble2.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Escher",
        author: {id: "xxx", name: "Cobertos"},
        description: "Escher-esque staircases",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/escher4.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Feel Good Inc Island",
        author: {id: "xxx", name: "Cobertos"},
        description: "The floating windmill island from the Gorillaz song Feel Good Inc",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/FloatingIslandFINAL.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Modern House",
        author: {id: "xxx", name: "Cobertos"},
        description: "A modern house with some secret bat cave like thing.",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/ModernHouseThing9.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      },{
        map: "Cloudy and Cobertos's Deathrun",
        author: {id: "xxx", name: "Cloudy8"},
        description: "Deathrun set in a jungle made for a custom Deathrun gamemode",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/cloudysDeathrunRevivedv8.brs"
      },{
        map: "Mini Challenge",
        author: {id: "xxx", name: "Cobertos"},
        description: "A tiny parkour challenge",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/myChallengeOnHatasServer.brs"
        //save_time: UTC as 8 bytes,
        //brick_count: int,
      }]
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
    async onEntryClick(e, url){
      console.log(e);
      if(e.target.tagName === "input") {
        return;
      }
      //Load the BRSHMesh
      console.log("Start download...");
      const brsObj = await fetch(url);
      this.brsBuff = await brsObj.arrayBuffer();
    }
  }
}
</script>

<style lang="scss">
.brs-main {
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  overflow: auto;
  width: 300px;
  color: white;

  .brs-list-item {
    min-height: 80px;
    text-align: left;
    padding: 20px;


    &:hover {
      background-image: linear-gradient(to left, #FFFFFF 0%, #AAAAAA 100%)
    }
  }

  //Scrollbar webkit
  &::-webkit-scrollbar {
      width: 12px;
      height: 12px;

      /*@include desktop {
          width: 10px;
          height: 10px;
      }*/
  }
  &::-webkit-scrollbar-button {
      display: none; //No up or down buttons
  }
  &::-webkit-scrollbar-thumb {
      background-color: #AAAAAA;
      border-radius: 9999px;
      &:hover {
          background-color: #FFFFFF;
      }
  }
  &::-webkit-scrollbar-track {
      display: none;
  }
  //Scrollbar IE and FF
  scrollbar-color: #AAAAAA rgba(0,0,0,0); //thumb track
  &:hover {
      scrollbar-color: #FFFFFF rgba(0,0,0,0); //thumb track
  }
}
</style>