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
          :key="brsInfo.brsUrl"
          @click="onEntryClick($event, brsInfo)"
          :class="{selected: brsInfo.selected}">
          <h2>{{brsInfo.name}}</h2>
          <p>{{brsInfo.author}}</p>
          <p v-if="false">{{brsInfo.description}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { noObserve } from '../utils.js';
import { BRSWorldAPI } from '../BRSWorldAPI.js';
import BRSViewer from './BRSViewer.vue';

export default {
  name: 'BRSUI',
  components: {
    BRSViewer
  },
  data(){ 
    return {
      file: undefined, //upload file
      brsBuff: undefined,
      interacting: false,
      api: new BRSWorldAPI(),
      brsInfoList: []
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
  async mounted(){
    this.brsInfoList = (await this.api.getFeaturedBuilds()).items;
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
      const brsObj = await fetch(brsInfo.brsUrl);
      this.brsBuff = await brsObj.arrayBuffer();
    },
    stopInteracting(){
      setTimeout(()=>this.interacting=false, 500);
    },
    openFileUploader(){
      this.$refs.fileUpload.click();
    },
    uploadFile(){
      //TODO: Handle errors from the endpoint
      this.api.uploadBuild(this.brsBuff);
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