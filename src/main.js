import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );

const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => console.log('Loading started');
loadingManager.onLoad = () => console.log('Loading complete');

// Model Loader
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  80,
  sizes.width / sizes.height,
  0.01,
  5000
);
camera.position.set( 51.94528807433705, 54.06258408456772, 100.72176363464604 );

const videoElement = document.createElement( "video" );
videoElement.src = "/textures/video/video.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture( videoElement );
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

loader.load( "/models/Room_Project_w_materials2.glb", (glb) => {
  const model = glb.scene;

  // Scale the model if too small
  model.scale.set(5, 5, 5); // Increase the size
  
  // Adjust the position
  model.position.set(0, -1, 0); // Move it down if it's floating above

  // Rotate if needed
  model.rotation.y = -Math.PI / 5;
  // console.log('Model loaded', glb.scene)

  model.traverse((child) => {
    if (child.isMesh) {
      child.material.transparent = false;
      child.visible = true;
    }

    if ( child.name === "Screen") {
      child.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
      })
    }
  });
  
  scene.add( model);
} );

const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.enablePan = true;
controls.update();

controls.target.set( -11.049151171881633, 36.54974980760134, -18.965333663440102);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0, 10, 10);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Event Listeners
window.addEventListener( "resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize( sizes.width, sizes.height );
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
} );

const render = () => {
  controls.update();

/*   console.log('camera.position', camera.position);
  console.log('00000000');
  console.log('controls.target', controls.target); */

  renderer.render( scene, camera );

  window.requestAnimationFrame( render );
}

render();