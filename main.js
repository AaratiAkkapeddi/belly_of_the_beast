import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;

init();

function init() {

        const container = document.createElement( 'div' );
        document.body.appendChild( container );
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
        camera.position.set( 0.5, 0.5, 4 );
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xff0000 );

        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
        // model

        const loader = new GLTFLoader().setPath( 'assets/' );
        loader.load( 'three.gltf', async function ( gltf ) {
                const model = gltf.scene;
                // wait until the model can be added to the scene without blocking due to shader compilation
                model.rotateY(90)
                await renderer.compileAsync( model, camera, scene );
                scene.add( model );
                render();

        } );

        

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

 

        window.addEventListener( 'resize', onWindowResize );

}


function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();

}

function render() {
        renderer.render( scene, camera );

}