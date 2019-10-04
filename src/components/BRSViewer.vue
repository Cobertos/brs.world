<template>
  <div>
    <canvas ref="renderer">No WebGL Boi</canvas>
    <div class="renderer-overlay"
      v-if="canControl">
      <transition name="hide">
        <p key="1" v-if="!isControlling">Take control of the camera by clicking</p>
        <p key="2" v-else>Press <kbd>Esc</kbd> to exit camera. <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>Space</kbd> <kbd>Shift</kbd> to move. Mouse to look.</p>
      </transition>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { BRSMesh } from '../BRSMesh.js';
import { BRSViewerScene } from '../BRSViewerScene.js';
import { noObserve } from '../utils.js';

export default {
  name: 'BRSViewer',
  props: {
    brsBuff: ArrayBuffer
  },
  data () {
    return {
      renderer: undefined,
      scene: noObserve(new BRSViewerScene()),
      cam: noObserve(new THREE.PerspectiveCamera(75, 1, 1, 80000)),
      buildBounds: undefined,
      rafID: undefined,
      controls: {
        isLocked: false
      },
      keyMap: {
        forward: false,
        backward: false,
        right: false,
        left: false,
        up: false,
        down: false,
        sprint: false
      },
      velocity: noObserve(new THREE.Vector3(0,0,0)),
      _lastTime: Date.now()
    };
  },
  computed:{
    isControlling(){
      return this.controls.isLocked;
    },
    canControl(){
      return !!this.brsBuff; //Needs to have a level loaded
    }
  },
  mounted () {
    //Setup the renderer
    this.renderer = noObserve(new THREE.WebGLRenderer({
      canvas: this.$refs.renderer,
      antialias: true,
      logarithmicDepthBuffer: true
    }));
    this.renderer.setClearColor(new THREE.Color(0x9999FF));

    //Setup the camera
    this.cam.position.set(0, 10, 0);

    //Controls
    this.controls = noObserve( new PointerLockControls( this.cam, this.renderer.domElement ), Object.keys(this.controls) );
    const handleKey = (e)=>{
      let keyDown = e.type === 'keydown';
      switch (event.key) {
        case "Down": // IE/Edge specific value
        case "ArrowDown":
        case "s":
        //If shift is held down 's' becomes 'S' so we need that as well
        //(and even if we wanted to exclude, an 's' keydown can be a 'S'
        //keyup later if shift is pressed in between)
        case "S":
          this.keyMap.forward = keyDown;
          break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
        case "w":
        case "W":
          this.keyMap.backward = keyDown;
          break;
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
        case "a":
        case "A":
          this.keyMap.left = keyDown;
          break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
        case "d":
        case "D":
          this.keyMap.right = keyDown;
          break;
        case "Space":
        case " ":
          this.keyMap.up = keyDown;
          break;
        case "Shift":
          this.keyMap.down = keyDown;
          break;
        case "Control":
          this.keyMap.sprint = keyDown;
          break;
        default:
          return; // Quit when this doesn't handle the key event.
      }
      e.preventDefault(); //We want to handle this key, so prevent default
      this.velocity.x = (-this.keyMap.left + this.keyMap.right);
      this.velocity.y = (-this.keyMap.down + this.keyMap.up);
      this.velocity.z = (-this.keyMap.backward + this.keyMap.forward);
      this.velocity.normalize();
      this.velocity.multiplyScalar(this.keyMap.sprint ? 2 : 1);
    };
    this.renderer.domElement.addEventListener('click', ()=>{
      if(!this.canControl) {
        return;
      }
      this.enableControls();
    });
    /*this.controls.addEventListener( 'lock', function () {
      instructions.style.display = 'none';
      blocker.style.display = 'none';
    } );
    this.controls.addEventListener( 'unlock', function () {
      blocker.style.display = 'block';
      instructions.style.display = '';
    } );*/
    this.scene.add( this.controls.getObject() );

    window.addEventListener( 'keydown' , handleKey);
    window.addEventListener( 'keyup', handleKey);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    //TODO: Unbind on destroy
  },
  watch: {
    async brsBuff () {
      if (!this.brsBuff) {
        return;
      }
      //Teardown old stuff
      window.cancelAnimationFrame(this.rafID);
      this.scene.remove(...this.scene.children.filter((obj) => obj instanceof BRSMesh));

      //Generate the new BRSMesh and add it
      /*const tex = await new Promise((resolve, reject) => {
          new THREE.TextureLoader()
            .load( 'https://rawcdn.githack.com/mrdoob/three.js/7e0a78beb9317e580d7fa4da9b5b12be051c6feb/examples/textures/uv_grid_opengl.jpg', resolve, undefined, reject );
        });*/
      let mesh = BRSMesh.fromBuffer(this.brsBuff);
      mesh.frustumCulled = false;
      this.scene.add(mesh);

      //Do some calculations for the new camera path
      //Find the center of gravity of all the bricks (the average vs the center of bounding box)
      let positions = mesh.brs.bricks
        .map((br) => {
          if (!br.visibility) { //TODO: Move into BRSMesh, these transformations shouldn't be out here
            return undefined;
          }
          return new THREE.Vector3(br.position[0], br.position[2], br.position[1]);
        })
        .filter((vec) => !!vec);
      let centerOfGravity = positions.reduce((acc, vec) => acc.add(vec), new THREE.Vector3(0, 0, 0))
        .multiplyScalar(1 / positions.length);
      //Find the mean and standard deviation from the centerOfGravity
      let distances = positions.map((vec) => vec.distanceTo(centerOfGravity));
      let meanDistance = distances.reduce((a, d) => a + d, 0) / positions.length;
      let varianceSum = distances.reduce((a, d) => a + Math.pow(Math.abs(d - meanDistance), 2), 0);
      let stdDevDistance = Math.sqrt(varianceSum / positions.length);

      //Compute the final camera bounding box discarding outliers
      let outliers = 0;
      this.buildBounds = noObserve(new THREE.Box3());
      mesh.brs.bricks.forEach((br) => {
        let distance = new THREE.Vector3(br.position[0], br.position[2], br.position[1]).distanceTo(centerOfGravity);
        if (distance > meanDistance + stdDevDistance * 3 || distance < meanDistance - stdDevDistance * 3) {
          console.log(`Removed outlier at Brickadia position ${br.position} ${distance}`);
          outliers++;
          return;
        }
        this.buildBounds.expandByPoint(new THREE.Vector3(br.position[0], br.position[2], br.position[1]));
      });
      console.log(`Center: ${centerOfGravity.x} ${centerOfGravity.y} ${centerOfGravity.z}`);
      console.log(`Mean: ${meanDistance}`);
      console.log(`StdD: ${stdDevDistance}`);
      console.log(`Outl: ${outliers}`);
      console.log(`BrickCount: ${positions.length}`);
      console.log(this.buildBounds);
      this.rafID = window.requestAnimationFrame(this.render.bind(this));
    }
  },
  methods: {
    resize () {
      this.$refs.renderer.setAttribute('style', '');
      let rect = this.$refs.renderer.getBoundingClientRect();
      this.renderer.setSize(rect.width, rect.height);
      this.cam.aspect = rect.width / rect.height;
      this.cam.updateProjectionMatrix();
    },
    render () {
      this.rafID = window.requestAnimationFrame(this.render.bind(this));

      if(!this.controls.isLocked) {
        //look in a circle over the whole map after it loads
        let theta = Date.now() / 1000 / 30 * Math.PI * 2;
        let x = Math.sin(theta);
        let z = Math.cos(theta);
        let center = this.buildBounds.getCenter(new THREE.Vector3());
        let exts = this.buildBounds.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        this.cam.position.copy(center);
        this.cam.position.add(new THREE.Vector3(exts.x * 1.5 * x, exts.y * 2, exts.z * 1.5 * z));
        this.cam.lookAt(center.clone().add(new THREE.Vector3(exts.x * x, 0, exts.z * z)));
      }
      else {
        let deltaTime = Date.now() - this._lastTime;
        let camForward = this.cam.getWorldDirection(new THREE.Vector3());
        let camRight = camForward.clone().cross(THREE.Object3D.DefaultUp).normalize();
        let camUp = THREE.Object3D.DefaultUp.clone();
        this.cam.position
          .add(camForward.multiplyScalar(-this.velocity.z * deltaTime))
          .add(camRight.multiplyScalar(this.velocity.x * deltaTime))
          .add(camUp.multiplyScalar(this.velocity.y * deltaTime));
      }
      this._lastTime = Date.now();
      this.renderer.render(this.scene, this.cam);
    },
    disableControls(){
      this.controls.unlock();
    },
    enableControls(){
      this.controls.lock();
    }
  }
};
</script>

<style lang="scss">
@import "../scss/_func.scss";

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.renderer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  pointer-events: none;
  text-align: center;

  > p {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    opacity: 1.0;
    padding: cRems(7px);
    background-color: rgba(51,51,51,0.5);
    border-radius: cRems(5px);
    display: inline-block;

    &.hide-enter-active, &.hide-leave-active {
      transition: opacity .5s;
    }
    &.hide-leave-to, &.hide-enter {
      opacity: 0.0;
    }
  }
}

</style>
