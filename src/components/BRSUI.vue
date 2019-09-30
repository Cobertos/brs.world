<template>
  <div class="brs-container">
    <BRSViewer :brsBuff="brsBuff"
      @click.native="interacting = false" />
    <div class="brs-main"
      :class="{'keep-open': keepSidebarOpen}"
      @mouseenter="interacting = true"
      @mouseleave="stopInteracting">
      <div class="brs-header">
        <h1>BRS.world</h1>
        <p>View and share your Brickadia builds</p>
        <p v-if="error" v-text="error" />
        <button
          @click="$refs.fileUpload.click()">Open .brs</button>
        <div v-if="fileToUpload">
          <p>{{fileToUpload.name}}</p>
          <p v-if="brs">{{brs.author.name}} - {{brs.map}}</p>
          <button
            @click="uploadFile"
            :disabled="!fileUploadIsValid">Upload</button>
        </div>
        <input type="file"
          ref="fileUpload"
          style="display:none"
          @change="onFileChange($event)" />
      </div>
      <div class="brs-list-container">
        <h2><u>Featured Builds</u></h2>
        <div class="brs-list">
          <div class="brs-list-item"
            v-for="brsInfo in brsInfoWState"
            :key="brsInfo.brsUrl"
            @click="onEntryClick($event, brsInfo)"
            :class="{selected: brsInfo.selected}">
            <h3>{{brsInfo.name}}</h3>
            <p>{{brsInfo.author}}</p>
            <p v-if="false">{{brsInfo.description}}</p>
          </div>
        </div>
      </div>
      <div class="brs-footer">
        <p>Made by <a href="http://twitter.com/cobertos" target="_blank">@Cobertos</a></p>
        <p><a href="https://github.com/Cobertos/brs.world" target="_blank">Hosted on GitHub</a></p>
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
      fileToUpload: undefined, //File object to upload
      error: undefined,        //An error in the BRS loading
      brsBuff: undefined,      //Buffer with brs data
      brs: undefined,          //Loaded from the buffer above with brs-js

      interacting: false,      //Whether the user is interacting with the sidebar
      api: new BRSWorldAPI(),  //API object
      brsInfoList: []          //List of brs's to load (pulled from backend)
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
    },
    keepSidebarOpen(){
      return this.interacting || //The boolean to keep it open a little longer than normal
        !this.hasBRSToView       //If there's no file uploaded yet
    },
    hasBRSToView(){
      return !!this.brs; //A successfully loaded brs
    },
    fileUploadIsValid(){
      return !!this.fileToUpload &&
        !this.error &&
        this.brs;
    }
  },
  async mounted(){
    this.brsInfoList = (await this.api.getFeaturedBuilds()).items;
  },
  methods:{
    resetUpload(){
      this.$refs.fileUpload.value = '';
      this.fileToUpload = undefined;
    },
    changeBRSData(brsBuff){
      this.error = undefined;
      this.brsBuff = brsBuff;
      try {
        this.brs = noObserve( BRS.read(brsBuff) );
      }
      catch(e) {
        this.error = e.message;
        this.brsBuff = undefined;
        this.brs = undefined;
        console.error(e);
      }
    },
    async onFileChange(e){
      //TODO: Reset the selected highlight
      const file = e.target.files[0];
      this.fileToUpload = file ? noObserve(file) : undefined;
      if(!file) {
        return;
      }
      console.log("Start file convert...");
      this.changeBRSData(await file.arrayBuffer());
    },
    async onEntryClick(e, brsInfo){
      this.resetUpload();
      //TODO: Handle when the user is uploading and tries to change level

      //Load the BRSHMesh
      this.brsInfoWState.forEach((brsInfo)=>brsInfo.selected = false);
      brsInfo.selected = true;
      console.log("Start download...");
      const brsObj = await fetch(brsInfo.brsUrl);
      this.changeBRSData(await brsObj.arrayBuffer());
    },
    stopInteracting(){
      setTimeout(()=>this.interacting=false, 500);
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover, &.keep-open {
    left: 0;
  }

  .brs-header, .brs-footer {
    flex: 0 0 auto;
  }
  .brs-list-container {
    flex: 1 0 auto;
  }

  .brs-header {
    padding: cRems(20px);
    h1 {
      margin-top: 0;
    }
  }

  > h2 {
    border-top: 1px solid white;
    margin: 0;
    padding: cRems(12px);
    > u {
      border-bottom: 1px solid white;
      text-decoration: none;
    }
  }

  .brs-list{
    overflow-y: auto;
    user-select: none;
    .brs-list-item {
      min-height: 40px;
      text-align: left;
      padding: cRems(15px);
      //Interesting chevron effect
      /*background-image: 
          linear-gradient(100deg, rgba(0,0,0,0) 20px, #112222 20px, #112222 40px, rgba(0,0,0,0) 40px),
          linear-gradient(100deg, rgba(0,0,0,0) 60px, #112222 60px, #112222 80px, rgba(0,0,0,0) 80px),
          linear-gradient(100deg, rgba(0,0,0,0) 100px, #112222 100px, #112222 120px, rgba(0,0,0,0) 120px),
          linear-gradient(100deg, rgba(0,0,0,0) 140px, #112222 140px);*/
      background-image: 
        linear-gradient(to right, $bigRed 50%, #333333 50%);
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
        background-color: $bigRed;
      }

      @keyframes selected-fade {
        from {
          background-color: white;
        }
        to {
          background-color: $bigRed;
        }
      }

      h3 {
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