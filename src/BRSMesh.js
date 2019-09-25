import brs from "brs-js";
import * as THREE from "three";
import { InstancedStandardMaterial } from "./InstancedStandardMaterial";

export class BRSMesh extends THREE.Mesh {
  /**Returns the THREE.js units of one stud on a 1x1x1 brick so we can work with everything
   * just as it exists in the BRS file and hopefully for how Brickadia sees it should we want
   * to do more advanced measurements.
   * NOTE: that when loaded from a BRS, a 1x1x1 will have a 5x5x6 .size property and a 1x1x1F will
   * have a 5x5x2 .size property but when aligning with .position, everything is off. It seems Brickadia
   * applies the 5x5x6 size to a 2x2x2 sized mesh (because it's 1 unit from center) so we need to multiply
   * this by 2 when using BoxBufferGeometry as that is a 1x1x1 size mesh (0.5 unit from center).
   * @returns {Number} The width of one brick
   */
  static brickWidth() {
    return 5*2;
  }

  constructor(brsjsData) {
    let [geo, mat] = BRSMesh._buildResources(brsjsData);
    super(geo, mat);
    //TODO: We should release the reference to this as some point
    //so that we don't have large chunks of memory we don't need
    //for large builds
    this.brs = brsjsData;
  }

  static fromBuffer(arrayBuffer) {
    console.log("Start parse...");
    let brsjsData = BRS.read(arrayBuffer);
    return new BRSMesh(brsjsData);
  }

  static _buildResources(brs) {
    //Mesh workflow (NOT PERFORMANT FOR LARGE BUILDS!)
    /*
    brs.colors = brs.colors.map((arr)=>{
      return new THREE.Color(arr[0] / 255, arr[1] / 255, arr[2] / 255);
    });
    brs.materials = brs.colors.map((color)=>new THREE.MeshBasicMaterial({ color }));
    brs.bricks = brs.bricks.map((br,idx)=>{
      let geo = new THREE.BoxBufferGeometry(1,1,1);
      let mat = brs.materials[br.color];
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(br.position[0], br.position[2], br.position[1]);
      mesh.scale.set(100,100,100);
      return mesh;
    });*/
    
    //Instanced Mesh Workflow
    let baseGeo = new THREE.BoxBufferGeometry(1,1,1);
    baseGeo.attributes.uv.array = baseGeo.attributes.uv.array.map((i)=>i/BRSMesh.brickWidth());
    let color = new THREE.Color(1,1,1);
    let buffGeo = new THREE.BufferGeometry();
    let instancePositions = [];
    let instanceQuaternions = [];
    let instanceScales = []
    let instanceColors = [];
    console.log("Starting load...")
    brs.bricks.forEach((br, idx)=>{
      if(idx % 1000 === 0) {
        console.log(`Brick ${idx}`);
      }
      if(!br.visibility) {
        //TODO: Put this in a list of meshs to render as wireframes
        return; //Don't render invisibles
      }

      let pos = new THREE.Vector3(br.position[0], br.position[2], br.position[1]);
      const axes = [
        new THREE.Vector3(1,0,0),  //Brickadia +X => THREE.js +X
        new THREE.Vector3(-1,0,0), //Brickadia -X => THREE.js -X
        new THREE.Vector3(0,0,1),  //Brickadia +Y => THREE.js +Z
        new THREE.Vector3(0,0,-1), //Brickadia -Y => THREE.js -Z
        new THREE.Vector3(0,1,0),  //Brickadia +Z => THREE.js +Y
        new THREE.Vector3(0,-1,0), //Brickadia -Z => THREE.js -Y
      ];
      const rots = [
        0,
        Math.PI/2,
        Math.PI,
        3*Math.PI/2
      ];
      let quat = new THREE.Quaternion().setFromAxisAngle(axes[br.direction], rots[br.rotation]);

      //A 1x1F is 5,5,2 size, seemingly meaning it's 10x10x4 units wide when playing around in game
      //A 1x1 is 5,5,6, seemingly 10x10x12
      //Because our cube is 1x1x1, we need to multiple size to get the correct scale
      let scale = new THREE.Vector3(br.size[0]*2, br.size[2]*2, br.size[1]*2);
      let color = Array.isArray(br.color) ? new THREE.Color(br.color[0]/255, br.color[1]/255, br.color[2]/255) :
        brs.colors[br.color];
      
      instancePositions.push( pos.x, pos.y, pos.z );
      instanceQuaternions.push( quat.x, quat.y, quat.z, quat.w );
      instanceScales.push( scale.x, scale.y, scale.z );
      instanceColors.push( color[0]/255, color[1]/255, color[2]/255 );
    });
    
    let instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.index = baseGeo.index;
    instancedGeometry.attributes.position = baseGeo.attributes.position;
    //instancedGeometry.attributes.color = baseGeo.attributes.color;
    instancedGeometry.addAttribute( 'instancePosition', new THREE.InstancedBufferAttribute( new Float32Array( instancePositions ), 3 ) );
    instancedGeometry.addAttribute( 'instanceQuaternion', new THREE.InstancedBufferAttribute( new Float32Array( instanceQuaternions ), 4 ) );
    instancedGeometry.addAttribute( 'instanceScale', new THREE.InstancedBufferAttribute( new Float32Array( instanceScales ), 3 ) );
    instancedGeometry.addAttribute( 'instanceColor', new THREE.InstancedBufferAttribute( new Float32Array( instanceColors ), 3 ) );

    let instancedMaterial = new InstancedStandardMaterial({
      vertexColors: THREE.VertexColors,
      flatShading: true,
      map: undefined
    });
    new THREE.TextureLoader().load("brickTOP.png",(tex)=>{
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        //tex.anisotopy = 8;
        //instancedMaterial.map = tex;
        //instancedMaterial.needsUpdate = true;
    });

    // instantiate a loader
    

    return [instancedGeometry, instancedMaterial];
  }
}



