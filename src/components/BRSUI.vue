<template>
  <div class="brs-container">
    <BRSViewer :brsBuff="brsBuff" />
    <div class="brs-main"
      :class="{'keep-open': interacting}"
      @mouseenter="interacting = true"
      @mouseleave="stopInteracting">
      <div class="brs-header">
        <h2>BRS.world</h2>
        <p>View and share your Brickadia builds</p>
        <button
          @click="openFileUploader">Open .brs</button>
        <p v-if="file">
          {{file.name}}{{file.size}}
          <button @click="uploadFile">Upload</button>
        </p>
        <input type="file"
          ref="fileUpload"
          style="display:none"
          @change="onFileChange($event)" />
      </div>
      <div class="brs-list">
        <div class="brs-list-item"
          v-for="brsInfo in brsInfoWState"
          :key="brsInfo.url"
          @click="onEntryClick($event, brsInfo)"
          :class="{selected: brsInfo.selected}">
          <h2>{{brsInfo.map}}</h2>
          <p>{{brsInfo.author.name}}</p>
          <p v-if="false">{{brsInfo.description}}</p>
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
      interacting: false,
      uploadFile: undefined,
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
      },{
        map: "DONOTUSE Stress Test - 14 mil",
        author: {id: "xxx", name: "Kodi"},
        description: "Stress test",
        url: "https://s3.us-east-2.amazonaws.com/cobstatic.com/brs.world/builds/spam+1x1f.brs"
      }]
    }
  },
  computed: {
    brsInfoWState(){
      return this.brsInfoList.map((obj)=>{
        return {
          selected: false,
          ...obj
        };
      });
    }
  },
  methods:{
    async onFileChange(e){
      console.log(e);
      const file = e.target.files[0];
      if(!file) {
        return;
      }
      this.file = noObserve(file);
      console.log("Start file convert...");
      this.brsBuff = await file.arrayBuffer();
    },
    async onEntryClick(e, brsInfo){
      console.log(e);
      if(e.target.tagName === "input") {
        return;
      }
      //Load the BRSHMesh
      this.brsInfoWState.forEach((brsInfo)=>brsInfo.selected = false);
      brsInfo.selected = true;
      console.log("Start download...");
      const brsObj = await fetch(brsInfo.url);
      this.brsBuff = await brsObj.arrayBuffer();
    },
    stopInteracting(){
      setTimeout(()=>this.interacting=false, 500);
    },
    openFileUploader(){
      this.$refs.fileUpload.click();
    }
  }
}
</script>

<style lang="scss">
@import "../scss/_func.scss";

.brs-main {
  position: absolute;
  left: -280px;
  top: 0;
  height: 100vh;
  width: 300px;
  color: white;
  transition: left 0.2s;
  background-color: #333333;

  &:hover, &.keep-open {
    left: 0;
  }

  .brs-list{
    overflow-y: auto;
    user-select: none;
    .brs-list-item {
      min-height: 40px;
      text-align: left;
      padding: 20px;
      //Interesting chevron effect
      /*background-image: 
          linear-gradient(100deg, rgba(0,0,0,0) 20px, #112222 20px, #112222 40px, rgba(0,0,0,0) 40px),
          linear-gradient(100deg, rgba(0,0,0,0) 60px, #112222 60px, #112222 80px, rgba(0,0,0,0) 80px),
          linear-gradient(100deg, rgba(0,0,0,0) 100px, #112222 100px, #112222 120px, rgba(0,0,0,0) 120px),
          linear-gradient(100deg, rgba(0,0,0,0) 140px, #112222 140px);*/
      background-image: 
        linear-gradient(to right, #CC4444 50%, #333333 50%);
      background-position: 100% 0;
      background-size: 200% 200%;
      background-repeat: no-repeat;
      transition: background-position 0.2s, background-color 0.2s;
      cursor: pointer;

      &:hover {
        background-position: 70% 0;
      }
      &:active, &.selected {
        background-position: 0 0;
      }
      &.selected {
        animation: selected-fade 2s;
        background-image: none;
        background-color: #CC4444;
      }

      @keyframes selected-fade {
        from {
          background-color: white;
        }
        to {
          background-color: #CC4444;
        }
      }

      h2 {
        margin: 0;
      }
      p {
        margin: 0;
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
        &:hover {
            background-color: #FFFFFF;
            cursor: pointer;
        }
    }
    &::-webkit-scrollbar-track {
        background-color: #333333;
    }
    //Scrollbar IE and FF
    scrollbar-color: #AAAAAA #333333; //thumb track
    &:hover {
        scrollbar-color: #FFFFFF #333333; //thumb track
    }
  }
}
</style>