import * as THREE from 'three';
import { BRSMesh } from './BRSMesh.js';

/**Scene that holds the BRSMesh and all other default lighting
 * and objects
 */
export class BRSViewerScene extends THREE.Scene {
  constructor () {
    super();
    //Load the assets
    //let envMapPath = 'https://cdn.rawgit.com/mrdoob/three.js/dev/examples/textures/cube/SwedishRoyalCastle/';
    //let envUrls = ["px", "nx", "py", "ny", "pz", "nz"].map((str)=>`${envMapPath}${str}.jpg`)
    //let env = await promisify(new THREE.CubeTextureLoader().load(urls));
    //env.format = THREE.RGBFormat;

    //Lighting
    // ambient light
    let ambLight = new THREE.AmbientLight(0xBBBBBB);
    this.add(ambLight);
    // directional light
    let dirLight = new THREE.DirectionalLight(0xFFFFFF);
    dirLight.position.set(20, 30, -5);
    dirLight.target.position.set(0, 0, 0);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.top = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.bottom = 30;
    dirLight.shadow.camera.near = 20;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 2048;
    this.add(dirLight);
    //Point light
    let light = new THREE.PointLight(0xffffdd, 2, 2);
    light.position.set(0, 3, -2);
    this.add(light);

    //Ground plane
    new THREE.TextureLoader().load('brickgreen.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      //tex.anisotopy = 8;
      groundMat.map = tex;
    });
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x00aa00,
      map: undefined
    });
    const groundPlaneSize = 100000;
    let groundPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(groundPlaneSize, groundPlaneSize),
      groundMat
    );
    let uv = groundPlane.geometry.getAttribute('uv');
    console.log(uv);
    uv.array = uv.array.map((i) => i * groundPlaneSize / BRSMesh.brickWidth());
    uv.needsUpdate = true;
    groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    groundPlane.frustumCulled = false;
    this.add(groundPlane);

    this.fog = new THREE.FogExp2(0x9999FF, 0.000025);
  }
}
