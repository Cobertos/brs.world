<template>
  <div class="brs-container">
    <BRSViewer
      :brs-buff="brsBuff"
      @click.native="interacting = false"
    />
    <div
      class="brs-main"
      :class="{'keep-open': keepSidebarOpen}"
      @mouseenter="interacting = true"
      @mouseleave="stopInteracting"
    >
      <div class="brs-header">
        <div class="brs-header-content">
          <div class="brs-header-title">
            <img class="logo" alt="brs.world logo" src="../assets/brsworld.svg">
            <h1>BRS.world</h1>
          </div>
          <p>Share your Brickadia builds</p>
          <div
            class="brs-upload"
            :class="{ 'upload-finished': uploadFinished }"
          >
            <p v-if="error" class="error" v-text="error" />
            <button
              @click="$refs.fileUpload.click()"
            >
              Open .brs
            </button>
            <div v-if="fileToUpload">
              <p>{{ fileToUpload.name }}</p>
              <p v-if="brs">
                {{ brs.author.name }} - {{ brs.map }}
              </p>
              <button
                :disabled="!fileUploadIsValid"
                @click="uploadFile"
              >
                Upload
              </button>
            </div>
            <input
              ref="fileUpload"
              type="file"
              style="display:none"
              @change="onFileChange($event)"
            >
          </div>
        </div>
        <svg class="brs-header-bg" width="300" height="300">
          <g id="cloud1" class="cloud"><path d="M-300,0C-300,0,300,0,300,0C500,33.33333333333333,500,66.66666666666666,300,100C200,161.6064433771357,100,161.6064433771357,0,100C-100,161.6064433771357,-200,161.6064433771357,-300,100C-500,66.66666666666666,-500,33.33333333333333,-300,0" /></g>
          <g id="cloud2" class="cloud"><path d="M-300,0C-300,0,300,0,300,0C500,33.33333333333333,500,66.66666666666666,300,100C200,161.6064433771357,100,161.6064433771357,0,100C-100,161.6064433771357,-200,161.6064433771357,-300,100C-500,66.66666666666666,-500,33.33333333333333,-300,0" /></g>
          <g id="cloud3" class="cloud"><path d="M-300,0C-300,0,300,0,300,0C500,33.33333333333333,500,66.66666666666666,300,100C200,161.6064433771357,100,161.6064433771357,0,100C-100,161.6064433771357,-200,161.6064433771357,-300,100C-500,66.66666666666666,-500,33.33333333333333,-300,0" /></g>
        </svg>
      </div>
      <div class="brs-list-container">
        <h2><u>Featured Builds</u></h2>
        <div class="brs-list">
          <div
            v-for="brsInfo in brsInfoWState"
            :key="brsInfo.brsUrl"
            class="brs-list-item"
            :class="{selected: brsInfo.selected}"
            @click="onEntryClick($event, brsInfo)"
          >
            <h3>{{ brsInfo.name }}</h3>
            <p>{{ brsInfo.author }}</p>
            <p v-if="false">
              {{ brsInfo.description }}
            </p>
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
/* global BRS */
import 'brs-js'; //On window.BRS (TODO: Fix this)
import { noObserve } from './utils.js';
import { BRSWorldAPI } from './BRSWorldAPI.js';
import BRSViewer from '@/components/BRSViewer.vue';

export default {
  name: 'BRSUI',
  components: {
    BRSViewer
  },
  data () {
    return {
      fileToUpload: undefined, //File object to upload
      uploadFinished: false,
      error: undefined, //An error in the BRS loading
      brsBuff: undefined, //Buffer with brs data
      brs: undefined, //Loaded from the buffer above with brs-js

      interacting: false, //Whether the user is interacting with the sidebar
      api: new BRSWorldAPI(), //API object
      brsInfoList: [] //List of brs's to load (pulled from backend)
    };
  },
  computed: {
    brsInfoWState () {
      return this.brsInfoList.map((obj) => {
        return {
          selected: false,
          ...obj
        };
      });
    },
    keepSidebarOpen () {
      return this.interacting || //The boolean to keep it open a little longer than normal
        !this.hasBRSToView; //If there's no file uploaded yet
    },
    hasBRSToView () {
      return !!this.brs; //A successfully loaded brs
    },
    fileUploadIsValid () {
      return !!this.fileToUpload &&
        !this.error &&
        this.brs;
    }
  },
  async mounted () {
    this.brsInfoList = (await this.api.getFeaturedBuilds()).items;
  },
  methods: {
    resetUpload () {
      this.$refs.fileUpload.value = '';
      this.fileToUpload = undefined;
    },
    changeBRSData (brsBuff) {
      this.error = undefined;
      this.brsBuff = brsBuff;
      try {
        this.brs = noObserve(BRS.read(brsBuff));
      } catch (e) {
        this.error = e.message;
        this.brsBuff = undefined;
        this.brs = undefined;
        console.error(e);
      }
    },
    async onFileChange (e) {
      //TODO: Reset the selected highlight
      const file = e.target.files[0];
      this.fileToUpload = file ? noObserve(file) : undefined;
      if (!file) {
        return;
      }
      console.log('Start file convert...');
      this.changeBRSData(await file.arrayBuffer());
    },
    async onEntryClick (e, brsInfo) {
      this.resetUpload();
      //TODO: Handle when the user is uploading and tries to change level

      //Load the BRSHMesh
      this.brsInfoWState.forEach((brsInfo) => { brsInfo.selected = false; });
      brsInfo.selected = true;
      console.log('Start download...');
      const brsObj = await fetch(brsInfo.brsUrl);
      this.changeBRSData(await brsObj.arrayBuffer());
    },
    stopInteracting () {
      setTimeout(() => { this.interacting = false; }, 500);
    },
    async uploadFile () {
      //TODO: Handle errors from the endpoint
      await this.api.uploadBuild(this.brsBuff);
      this.uploadFinished = true;
      this.resetUpload();
    }
  }
};
</script>

<style lang="scss">
@import "./scss/main.scss";

.error {
  color: $bigRed;
}

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
    flex: 1 1 auto;
  }

  .brs-header {
    padding: cRems(20px);
    h1 {
      margin-top: 0;
    }

    .brs-header-content {
      position: relative;
      z-index: 2;

      .brs-header-title {
        display: flex;
        justify-content: space-around;
        align-items: center;

        .logo {
          width: 60px;
        }

        h1 {
          margin: 0;
        }
      }
    }

    .brs-header-bg {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .brs-upload {
      &.upload-finished {
        animation: upload-finish-pop-fade 2s;
      }

      @keyframes upload-finish-pop-fade {
        from {
          background-color: white;
        }
        to {
          background-color: transparent;
        }
      }
    }
  }

  .brs-list-container {
    overflow-y: auto;
    user-select: none;

    > h2 {
      text-align: center;
      margin: 0;
      padding: cRems(12px);
      > u {
        border-bottom: 1px solid white;
        text-decoration: none;
      }
    }

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

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }
  .cloud {
    pointer-events: none;
    fill: #444;
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    transform: translateX();
    animation: cloud1 13s linear infinite;

    &:nth-child(2) {
      fill: #555;
      animation-delay: 7s;
      animation: cloud2 22s linear infinite;
    }
    &:nth-child(3) {
      fill: #666;
      left: 0;
      animation-delay: 3s;
      animation: cloud3 17s linear infinite;
    }
  }

  @keyframes cloud1 {
    0% {
       transform: matrix(1,0,0,1,0,-10);
    }
    100% {
       transform: matrix(1,0,0,1,300,-10);
    }
  }
  @keyframes cloud2 {
    0% {
       transform: matrix(1,0,0,1,0,-30);
    }
    100% {
       transform: matrix(1,0,0,1,300,-30);
    }
  }
  @keyframes cloud3 {
    0% {
       transform: matrix(1,0,0,1,0,-50);
    }
    100% {
       transform: matrix(1,0,0,1,300,-50);
    }
  }

  .brs-footer {
    text-align: center;
  }
}
</style>
