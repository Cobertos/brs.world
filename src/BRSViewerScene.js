import * as THREE from 'three';

/**Scene that holds the BRSMesh and all other default lighting
 * and objects
 */
export class BRSViewerScene extends THREE.Scene {
    constructor(){
        super();
        //Load the assets
        //let envMapPath = 'https://cdn.rawgit.com/mrdoob/three.js/dev/examples/textures/cube/SwedishRoyalCastle/';
        //let envUrls = ["px", "nx", "py", "ny", "pz", "nz"].map((str)=>`${envMapPath}${str}.jpg`)
        //let env = await promisify(new THREE.CubeTextureLoader().load(urls));
        //env.format = THREE.RGBFormat;

        //Lighting
        // ambient light
        let am_light = new THREE.AmbientLight( 0xBBBBBB );
        this.add( am_light );
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
        this.add( dir_light );
        //Point light
        let light = new THREE.PointLight( 0xffffdd, 2, 2 );
        light.position.set(0,3,-2);
        this.add(light);

        //Ground plane
        let groundPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 5, 20 ),
            new THREE.MeshStandardMaterial( {color: 0x00aa00} ));
        groundPlane.scale.set(100000,100000,100000);
        groundPlane.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
        groundPlane.frustumCulled = false;
        this.add(groundPlane);
    }
}