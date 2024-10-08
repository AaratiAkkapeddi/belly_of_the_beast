import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from './custom/myDot.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let camera, scene, renderer,composer;
let soldier;


const submitForm = () => {
        let answer = (document.getElementById("answer")).value;
        answer = answer.trim();
       if(answer?.length>0){
        let formData;
        formData = new FormData();
        formData.append("answer", answer);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://script.google.com/macros/s/AKfycbzOLtOpNBIvSE9jfVBuQEjRYWSYQZT_4Y6il-J7akbUbedY6kl8JkVvGKaXcdziNNGgWg/exec");
        xhr.send(formData);
        xhr.onload = function() {
          if (xhr.status === 200) {
            console.log("Form submitted successfully");
            document.querySelector("#feed").classList.add("submitted");
            (document.getElementById("answer")).value = "";
            let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRDCwu9PBQFqCvShGXvqwEUCteZ-TVuKKWMZq2fBOX7jenh9kEcvKqRnf9HQdJ70pCj56XzvvgtXBlX/pub?gid=0&single=true&output=csv"
            let xmlhttp=new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                if(xmlhttp.readyState == 4 && xmlhttp.status==200){
                   console.log(xmlhttp.responseText)
                   document.getElementById("list").innerHTML = "<br>" + xmlhttp.responseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                }
                };
                xmlhttp.open("GET",url,true);
                xmlhttp.send(null);
           // https://docs.google.com/spreadsheets/d/e/2PACX-1vRDCwu9PBQFqCvShGXvqwEUCteZ-TVuKKWMZq2fBOX7jenh9kEcvKqRnf9HQdJ70pCj56XzvvgtXBlX/pubhtml

          } else {
            console.log("Error submitting form. Please try again later.");
            
          }
        };
      }
}

init();

function init() {
        document.querySelector("#submit").addEventListener("click", submitForm)
        const container = document.createElement( 'div' );
        document.body.appendChild( container );
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
        camera.position.set( 0, 0.5, 3.7 );
        if(window.innerWidth < 900){
                camera.position.set( 0,0.5, 10 );
        }
        scene = new THREE.Scene();
        scene.background = null;

        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
        
 
        // model
         
        const loader = new GLTFLoader().setPath( 'assets/' );
        loader.load( 'tiger_test.gltf', async function ( gltf ) {
                const model = gltf.scene;
                // wait until the model can be added to the scene without blocking due to shader compilation
                model.rotateY(-90)

                
                await renderer.compileAsync( model, camera, scene );
                model.traverse((o) => {
                        if (o.isMesh) o.material.extensions = {
                                derivatives: true
                             };
                })   
                scene.add( model );
                // scene.add(wireFrameModel)
                render();

                // document.querySelector("button").addEventListener("click", function(){
                //                    model?.traverse((o) => {
                //                 if (o.isMesh) o.material.wireframe = true;
                //         })  
                // })
     
        } );

        loader.load( 'soldier_test.gltf', async function ( gltf ) {
                soldier = gltf.scene;
                soldier.rotateY(-90)
           

                // wait until the model can be added to the scene without blocking due to shader compilation
       

                soldier.traverse((o) => {
                        if (o.isMesh) o.material.extensions = {
                                derivatives: true
                             };
                })  
                await renderer.compileAsync( soldier, camera, scene );
                scene.add( soldier );
                // scene.add( wireFrameModel );

                render();

        } );

        
        // controls.update();

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );
        renderer.context?.getExtension('OES_standard_derivatives');

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.maxPolarAngle = Math.PI/2; 
        controls.minPolarAngle = Math.PI/2 - 0.4; 

        controls.minAzimuthAngle = Math.PI/4
        controls.maxAzimuthAngle = Math.PI/1.5
        controls.maxDistance = 5;
        if(window.innerWidth < 900){
                controls.maxDistance = 12;
        }
       
        controls.addEventListener("change", function(){
                var zoom = controls.target.distanceTo( controls.object.position )
                if(zoom < 0.5){
                        document.querySelector(".video").classList.add("on")
                        document.querySelector("#about").classList.add("on")
                        document.querySelector("#link-to-book").classList.add("on")
                        document.querySelector("canvas").classList.add("on")
                        document.querySelector("#zoom").classList.add("on")
                        document.querySelector("#feed").classList.add("on")
                        document.querySelector("#feed").classList.remove("submitted");
                        document.getElementById("list").innerHTML = "";

                }else{
                        document.querySelector(".video").classList.remove("on")
                        document.querySelector("canvas").classList.remove("on")
                        document.querySelector("#zoom").classList.remove("on")
                        document.querySelector("#feed").classList.remove("on")
                        document.querySelector("#about").classList.remove("on")
                        document.querySelector("#link-to-book").classList.remove("on")
                }
        })
        controls.update()
        // postprocessing

				composer = new EffectComposer( renderer );
				composer.addPass( new RenderPass( scene, camera ) );

				const effect1 = new ShaderPass( DotScreenShader );
				effect1.uniforms[ 'scale' ].value = 4;
				composer.addPass( effect1 );

				// const effect2 = new ShaderPass( RGBShiftShader );
				// effect2.uniforms[ 'amount' ].value = 0.0015;
				// composer.addPass( effect2 );

				// const effect3 = new OutputPass();
				// composer.addPass( effect3 );

				//
        window.addEventListener( 'resize', onWindowResize );

        function animate() {
                

                // if(Math.random() < 0.5){
                //         soldier?.traverse((o) => {
                //                 if (o.isMesh) o.material = original_material;
                //         })  
                // }
                requestAnimationFrame( animate )
    
                // required if controls.enableDamping or controls.autoRotate are set to true
                controls.update();
                // console.log(navigator.userAgent.toLowerCase() )
                composer.render();
                // renderer.render( scene, camera );

        }
        animate()
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


document.querySelector("#about").addEventListener("click", function(){
        let modal = document.querySelector(".modal");
        if(modal.classList.contains("on")){
           modal.classList.remove("on");
        }else{
           modal.classList.add("on")
        }
})
document.querySelector("#close").addEventListener("click", function(){
        let modal = document.querySelector(".modal");

           modal.classList.remove("on");

       
})