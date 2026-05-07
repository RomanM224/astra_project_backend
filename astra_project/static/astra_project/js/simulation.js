import * as THREE from 'https://esm.sh/three@0.132.2';
import { OrbitControls } from 'https://esm.sh/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TWEEN } from 'https://esm.sh/three@0.132.2/examples/jsm/libs/tween.module.min.js';
const scene = new THREE.Scene();
const textureLoader1 = new THREE.TextureLoader();
const texture = textureLoader1.load("/static/images/simulation_bg3.png");
scene.background = texture;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.z = 150;
camera.position.y = 90;
camera.position.x = -150;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .1, 0, 0);
composer.addPass(bloomPass);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 0);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
const textureLoader = new THREE.TextureLoader();
const planets = [];
const stars = [];
const satellites = [];
const planetsMap = new Map();
const starsMap = new Map();
const satellitesMap = new Map();
const starData = window.starData || [];
const planetData = window.planetData || [];
const satelliteData = window.satelliteData || [];
const starPlanetData = window.starPlanetData || [];
const planetSatelliteData = window.planetSatelliteData || [];
if (starData.length === 0 && planetData.length === 0) {
    console.warn("No Solar System data found. Make sure window.starData and window.planetData are populated in the HTML template.");
}
starData.forEach(data => {
    createStar(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.position);
});
let saturn;
planetData.forEach(data => {
    const planetObj = createPlanet(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.positionX);
    if (data.name === 'Saturn') {
        saturn = planetObj;
    }
});
satelliteData.forEach(data => {
    createSatellite(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.positionX)
});
starPlanetData.forEach(data => {
    let star = starsMap.get(data.starId);
    let planet = planetsMap.get(data.planetId);
    if (star && planet) {
        star.add(planet[0]);
    }
})
planetSatelliteData.forEach(data => {
    let planet = planetsMap.get(data.planetId);
    let satellite = satellitesMap.get(data.satelliteId);
    if (planet && satellite) {
        planet[1].add(satellite);
    }
})
function createStar(id, name, description, size, textureURL, distance, speed, position) {
    let starSize = Number((size / 55700).toFixed(4));
    if(starSize < 1){
        starSize = 4;
    }
    const geometry = new THREE.SphereGeometry(starSize, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(textureURL)
    });
    const star = new THREE.Mesh(geometry, material);
    const starObj = new THREE.Object3D();
    star.name = name;
    star.userData = { description };
    starObj.add(star);
    let starDistance
    if (distance < 4000000000) {
        starDistance = distance / 1500000;
    } else {
        starDistance = 4000;
    }
    star.position.x = starDistance;
    starObj.rotation.y = position;
    const orbitGeometry = new THREE.RingGeometry(starDistance - 1, starDistance + 1, 512);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI;
    starObj.add(orbit);
    starsMap.set(id, star);
    scene.add(starObj);
    stars.push({ star, starObj, speed });
}
function createPlanet(id, name, description, size, textureURL, distance, speed, position) {
    const planetSize = Number((size / 12700).toFixed(4));
    const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureURL)
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = name;
    planet.userData = { description };
    const planetObj = new THREE.Object3D();
    planetObj.add(planet);
    let planetDistance = distance / 1500000;
    let starSize = 0;
    starPlanetData.forEach(data => {
        if (data.planetId == id) {
            let star = starsMap.get(data.starId);
            starSize = star.geometry.parameters.radius;
        }
    })
    planetDistance = planetDistance + starSize;
    planet.position.x = planetDistance;
    planetObj.rotation.y = position;
    const orbitGeometry = new THREE.RingGeometry(planetDistance - 0.1, planetDistance + 0.1, 512);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI;
    planetObj.add(orbit);
    planetsMap.set(id, [planetObj, planet]);
    planets.push({ planet, planetObj, speed });
    return { planet, planetObj };
}

function createSatellite(id, name, description, size, textureURL, distance, speed, position) {
    const satelliteSize = Number((size / 12700).toFixed(4));
    const geometry = new THREE.SphereGeometry(satelliteSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureURL)
    });
    const satellite = new THREE.Mesh(geometry, material);
    satellite.name = name;
    satellite.userData = { description };
    const satelliteObj = new THREE.Object3D();
    satelliteObj.add(satellite);
    let planetSize = 0;
    planetSatelliteData.forEach(data => {
        if (data.satelliteId == id) {
            let planet = planetsMap.get(data.planetId);
            planetSize = planet[1].geometry.parameters.radius;
        }
    })
    var satelliteDistance = distance / 400000;
    satelliteDistance = satelliteDistance + planetSize;
    satellite.position.x = satelliteDistance;
    satelliteObj.rotation.y = position;
    const orbitGeometry = new THREE.RingGeometry(satelliteDistance - 0.1, satelliteDistance + 0.1, 512);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI;
    satelliteObj.add(orbit);
    satellitesMap.set(id, satelliteObj);
    satellites.push({ satellite, satelliteObj, speed });
}

const ringGeometry = new THREE.RingGeometry(20, 25, 32);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = -0.5 * Math.PI;
if (saturn) {
    saturn.planet.add(ring);
}
const planetButtonsContainer = document.getElementById('planet-buttons');
if (planetButtonsContainer) {
    planets.forEach(({ planet }) => {
        const button = document.createElement('button');
        button.textContent = planet.name;
        button.addEventListener('click', () => {
            handlePlanetClick(planet);
        });
        planetButtonsContainer.appendChild(button);
    });
    stars.forEach(({ star }) => {
        const button = document.createElement('button');
        button.textContent = star.name;
        button.addEventListener('click', () => {
            handlePlanetClick(star);
        });
        planetButtonsContainer.appendChild(button);
    });
}
let targetPlanet = null;
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    const delta = clock.getDelta();
    satellites.forEach(s => {
        if (s.speed == 0) {
            s.satelliteObj.rotation.y = 0;
        } else {
            s.satelliteObj.rotation.y += delta * Math.PI * 2 / (s.speed / 8);
        }
        s.satellite.rotation.y += 0.0001;
    });
    stars.forEach(s => {
        if (s.speed == 0) {
            s.starObj.rotation.y = 0;
        } else {
            s.starObj.rotation.y += delta * Math.PI * 2 / (s.speed / 8);
        }
        s.star.rotation.y += 0.0001;
    });
    planets.forEach(p => {
        if (p.speed == 0) {
            p.planetObj.rotation.y = 0;
        } else {
            p.planetObj.rotation.y += delta * Math.PI * 2 / (p.speed / 8);
        }
        p.planet.rotation.y += 0.001;
    });
    if (targetPlanet) {
        const targetPosition = new THREE.Vector3();
        targetPlanet.getWorldPosition(targetPosition);
        controls.target.copy(targetPosition);
    }
    controls.update();
    composer.render();
}
animate();
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
});
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let infoPanel = document.getElementById('info-panel');
let planetName = document.getElementById('planet-name');
let planetDescription = document.getElementById('planet-description');
let closeBtn = document.getElementById('close-btn');
if (!infoPanel) {
    infoPanel = document.createElement('div');
    infoPanel.id = 'info-panel';
    Object.assign(infoPanel.style, {
        position: 'absolute',
        bottom: '00px',
        top: 'auto',
        left: '200px',
        width: '300px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'none',
        zIndex: '1000',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backdropFilter: 'blur(5px)'
    });
    infoPanel.innerHTML = `
        <h2 id="planet-name" style="margin: 0 0 10px 0; font-size: 1.5rem; color: #ffffff;">Planet Name</h2>
        <p id="planet-description" style="font-size: 0.95rem; line-height: 1.5; color: #ddd;"></p>
        <button id="close-btn" style="
            margin-top: 5px;
            padding: 8px 16px;
            background: linear-gradient(to right, #fbca37 0%, #a28305 100%);
            border: none;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            cursor: pointer;
        ">Close</button>
    `;
    document.body.appendChild(infoPanel);
    planetName = document.getElementById('planet-name');
    planetDescription = document.getElementById('planet-description');
    closeBtn = document.getElementById('close-btn');
}
closeBtn.addEventListener('click', () => {
    infoPanel.style.display = 'none';
    targetPlanet = null;
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 0, z: 50 }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
});
function handlePlanetClick(selectedPlanet) {
    targetPlanet = selectedPlanet;
    planetName.textContent = selectedPlanet.name;
    planetDescription.textContent = selectedPlanet.userData.description;
    infoPanel.style.display = 'block';
    const targetPosition = new THREE.Vector3();
    selectedPlanet.getWorldPosition(targetPosition);
    const cameraOffset = new THREE.Vector3(0, selectedPlanet.geometry.parameters.radius * 2, selectedPlanet.geometry.parameters.radius * 4);
    const newCameraPosition = targetPosition.clone().add(cameraOffset);
    new TWEEN.Tween(camera.position)
        .to(newCameraPosition, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    new TWEEN.Tween(controls.target)
        .to(targetPosition, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}
window.addEventListener('click', (event) => {
    if (event.target.closest('nav') || event.target.closest('#info-panel') || event.target.closest('#planet-buttons')) {
        return;
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0 && intersects[0].object.name) {
        handlePlanetClick(intersects[0].object);
    }
});