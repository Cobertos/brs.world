import brs from "brs-js";
import * as THREE from "three";

export class BRSMesh extends THREE.Mesh {
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
      let pos = new THREE.Vector3(br.position[0], br.position[2], br.position[1]);
      let quat = new THREE.Quaternion(0,0,0,1);
      //A 1x1F is 5,5,2 size, seemingly meaning it's 10x10x4 units wide when playing around in game
      //A 1x1 is 5,5,6, seemingly 10x10x12
      //Because our cube is 1x1x1, we need to multiple size to get the correct scale
      let scale = new THREE.Vector3(br.size[0]*2, br.size[2]*2, br.size[1]*2);
      let color = brs.colors[br.color];
      
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
    
    let shaderMaterial = new THREE.ShaderMaterial( {
      uniforms: {},
      vertexShader: `
      precision highp float;
          attribute vec3 instancePosition;
          attribute vec4 instanceQuaternion;
          attribute vec3 instanceScale;
      attribute vec3 instanceColor;
          varying vec3 vColor;
          vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
              position *= scale;
              position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
              return position + translation;
          }
          void main(){
              vColor = instanceColor;//color;
              vec3 transformed = applyTRS( position.xyz, instancePosition, instanceQuaternion, instanceScale );
              gl_Position = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );
          }
      `,
      fragmentShader: `
      precision highp float;
          varying vec3 vColor;
          void main() {
              gl_FragColor = vec4( vColor, 1.0 );
          }
      `
    } );

    return [instancedGeometry, shaderMaterial];
  }
}



