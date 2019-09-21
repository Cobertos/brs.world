<template>
  <canvas ref="renderer">No WebGL Boi</canvas>
</template>

<script>
import * as THREE from 'three';
import { BRSMesh } from '../BRSMesh.js';
import { BRSViewerScene } from '../BRSViewerScene.js';
import { noObserve } from '../utils.js';

export default {
  name: 'BRSViewer',
  props: {
    brsBuff: ArrayBuffer
  },
  data(){ 
    return {
        renderer: undefined,
        scene: noObserve(new BRSViewerScene()),
        cam: noObserve(new THREE.PerspectiveCamera( 75, 1, 100, 80000 )),
        buildBounds: undefined,
        rafID: undefined
    }
  },
  mounted(){
    //Setup the renderer
    this.renderer = noObserve(new THREE.WebGLRenderer({
      canvas: this.$refs.renderer
    }));
    this.renderer.setClearColor(new THREE.Color(0x9999FF));
    let rect = this.$refs.renderer.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);

    //Setup the camera
    this.cam.position.set(0,10,0);
  },
  watch: {
    brsBuff(){
        if(!this.brsBuff) {
            return;
        }
        //Teardown old stuff
        window.cancelAnimationFrame(this.rafID);
        this.scene.remove(...this.scene.children.filter((obj)=>obj instanceof BRSMesh));

        //Generate the new BRSMesh and add it
        let mesh = BRSMesh.fromBuffer(this.brsBuff);
        mesh.frustumCulled = false;
        this.scene.add( mesh );
        
        //Do some calculations for the new camera path
        this.buildBounds = noObserve(new THREE.Box3());
        mesh.brs.bricks.forEach((br)=>{
          this.buildBounds.expandByPoint(new THREE.Vector3(br.position[0], br.position[2], br.position[1]));
        });
        console.log(this.buildBounds);
        this.rafID = window.requestAnimationFrame(this.render.bind(this));
    }
  },
  methods:{
    render(){
        this.rafID = window.requestAnimationFrame(this.render.bind(this));
        //look in a circle over the whole map after it loads
        let theta = Date.now() / 1000 /10 * Math.PI * 2;
        let x = Math.sin(theta);
        let z = Math.cos(theta);
        let center = this.buildBounds.getCenter(new THREE.Vector3());
        let exts = this.buildBounds.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        this.cam.position.copy(center);
        this.cam.position.add(new THREE.Vector3(exts.x * 1.5 * x, exts.y * 1.5, exts.z * 1.5 * z));
        this.cam.lookAt(center.clone().add(new THREE.Vector3(exts.x * x, 0, exts.z * z)));
        this.renderer.render(this.scene, this.cam);
    }
  }
}
</script>

<style lang="scss">
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
</style>