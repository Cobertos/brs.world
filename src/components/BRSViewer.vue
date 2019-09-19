<template>
  <canvas ref="renderer">No WebGL Boi</canvas>
</template>

<script>
import * as THREE from 'three';
import { BRSMesh } from '../BRSMesh.js';
import { noObserve } from '../utils.js';

export default {
  name: 'BRSViewer',
  data(){ 
    return {
      renderer: undefined,
      scene: noObserve(new THREE.Scene()),
      cam: noObserve(new THREE.PerspectiveCamera( 75, 1, 100, 80000 )),
      buildBounds: noObserve(new THREE.Box3())
    }
  },
  async mounted(){
    //Remove all the old stuff before we readd
    this.scene.remove(...this.scene.children);


    //Load the assets
    let envMapPath = 'https://cdn.rawgit.com/mrdoob/three.js/dev/examples/textures/cube/SwedishRoyalCastle/';
    //let envUrls = ["px", "nx", "py", "ny", "pz", "nz"].map((str)=>`${envMapPath}${str}.jpg`)
    //let env = await promisify(new THREE.CubeTextureLoader().load(urls));
    //env.format = THREE.RGBFormat;

    //Setup the renderer
    this.renderer = noObserve(new THREE.WebGLRenderer({
      canvas: this.$refs.renderer
    }));
    this.renderer.setClearColor(new THREE.Color(0x9999FF));
    let rect = this.$refs.renderer.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);

    //Setup the camera
    this.cam.position.set(0,10,0);

    //Lighting
    // ambient light
    let am_light = new THREE.AmbientLight( 0xBBBBBB );
    this.scene.add( am_light );
    // directional light
    let dir_light = new THREE.DirectionalLight( 0xFFFFFF );
    dir_light.position.set( 20, 30, -5 );
    dir_light.target.position.set(0,0,0);
    dir_light.castShadow = true;
    dir_light.shadow.camera.left = -30;
    dir_light.shadow.camera.top = -30;
    dir_light.shadow.camera.right = 30;
    dir_light.shadow.camera.bottom = 30;
    dir_light.shadow.camera.near = 20;
    dir_light.shadow.camera.far = 200;
    dir_light.shadow.bias = -.001
    dir_light.shadow.mapSize.width = dir_light.shadow.mapSize.height = 2048;
    this.scene.add( dir_light );
    //Point light
    let light = new THREE.PointLight( 0xffffdd, 2, 2 );
    light.position.set(0,3,-2);
    this.scene.add(light);

    //Ground plane
    let groundPlane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 5, 20 ),
        new THREE.MeshStandardMaterial( {color: 0x00aa00} ));
    groundPlane.scale.set(100000,100000,100000);
    groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
    groundPlane.frustumCulled = false;
    this.scene.add(groundPlane);

    //Load the BRSHMesh
    console.log("Start download...");
    const brsObj = await fetch("https://s3.us-east-2.amazonaws.com/bepis.co/cloudysDeathrunRevivedv8.brs");
    const brsBuff = await brsObj.arrayBuffer();

    // counterparts are drawn all at once with a single draw call (via instanced rendering)
    let mesh = BRSMesh.fromBuffer(brsBuff);
    mesh.frustumCulled = false;
    mesh.position.x = 0.1;
    this.scene.add( mesh );
    
    //Place in scene and do calculations
    mesh.brs.bricks.forEach((br)=>{
      this.buildBounds.expandByPoint(new THREE.Vector3(br.position[0], br.position[2], br.position[1]));
    });
    console.log(this.buildBounds);
    window.requestAnimationFrame(this.render.bind(this));
  },
  methods:{
    render(){
      window.requestAnimationFrame(this.render.bind(this));
      //look in a circle over the whole map after it loads
      let theta = Date.now() / 1000 /10 * Math.PI * 2;
      let x = Math.sin(theta);
      let z = Math.cos(theta);
      let center = this.buildBounds.getCenter();
      let exts = this.buildBounds.getSize().multiplyScalar(0.5);
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