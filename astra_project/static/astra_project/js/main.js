import * as THREE from 'https://esm.sh/three@0.132.2';
import { OrbitControls } from 'https://esm.sh/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TWEEN } from 'https://esm.sh/three@0.132.2/examples/jsm/libs/tween.module.min.js';
const keyState = {};

// --- Базовая настройка сцены ---
const scene = new THREE.Scene(); // Создаем сцену, которая будет содержать все объекты

// --- Фон (Skybox) ---
// Используем TextureLoader для загрузки изображения, которое будет служить фоном
const textureLoader1 = new THREE.TextureLoader();
//const texture = textureLoader1.load("/static/images/textures/milky_way_panaram.jpg"); // Загружаем панораму Млечного Пути
const texture = textureLoader1.load("/static/images/simulation_bg3.png"); // Загружаем панораму Млечного Пути

scene.background = texture; // Устанавливаем загруженную текстуру как фон сцены
// scene.background = new THREE.Color(0x999999); // Альтернативный вариант: сплошной тёмно-серый цвет


// --- Камера ---
// Создаем перспективную камеру
// window.innerWidth / window.innerHeight - соотношение сторон
// 0.1 - ближняя плоскость отсечения
// 1000 - дальняя плоскость отсечения
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.z = 150; // Устанавливаем начальную позицию камеры по оси Z
camera.position.y = 90;
camera.position.x = -150;

// --- Рендерер ---
const renderer = new THREE.WebGLRenderer(); // Создаем WebGL рендерер
renderer.setSize(window.innerWidth, window.innerHeight); // Устанавливаем размер рендерера равным размеру окна
document.body.appendChild(renderer.domElement); // Добавляем canvas рендерера в DOM

// --- Постобработка для эффекта свечения (Bloom) ---
// EffectComposer управляет последовательностью проходов постобработки
const composer = new EffectComposer(renderer);
// RenderPass - это базовый проход, который просто рендерит нашу сцену
composer.addPass(new RenderPass(scene, camera));

// UnrealBloomPass создает эффект "свечения" для ярких объектов
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .1, 0, 0);
composer.addPass(bloomPass); // Добавляем проход свечения в композер


// --- Настройка управления и освещения ---
// OrbitControls позволяет пользователю вращать камеру вокруг центральной точки
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Включает "инерцию" для более плавного вращения

// Добавляем рассеянный свет, который равномерно освещает все объекты
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Добавляем точечный источник света, имитирующий Солнце
const pointLight = new THREE.PointLight(0xffffff, 1, 0); // Белый свет, интенсивность 1
pointLight.position.set(0, 0, 0); // Помещаем источник света в центр сцены
scene.add(pointLight);

// --- Создание объектов Солнечной системы ---
const textureLoader = new THREE.TextureLoader(); // Создаем загрузчик текстур для планет

// Массив для хранения данных о планетах (для анимации)
const planets = [];
const stars = [];
const satellites = [];

const planetsMap = new Map();
const starsMap = new Map();
const satellitesMap = new Map();

// --- Fetch Data from Window (populated by Django) ---
const starData = window.starData || [];
const planetData = window.planetData || [];
const satelliteData = window.satelliteData || [];
const starPlanetData = window.starPlanetData || [];
const planetSatelliteData = window.planetSatelliteData || [];


// Fallback warning if data is missing
if (starData.length === 0 && planetData.length === 0) {

    console.warn("No Solar System data found. Make sure window.starData and window.planetData are populated in the HTML template.");
}

// Создаем звёзды
starData.forEach(data => {

    createStar(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.position);
});

let earth, saturn;

// --- Создаем все планеты Солнечной системы ---
planetData.forEach(data => {

    const planetObj = createPlanet(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.positionX);
    if (data.name === 'Earth') {
        earth = planetObj;
    }
    if (data.name === 'Saturn') {
        saturn = planetObj;
    }
});

// Создаем спутники
satelliteData.forEach(data => {

    createSatellite(data.id, data.name, data.description, data.size, data.textureURL, data.distance, data.speed, data.positionX)
});

// Связываем сзёзды с планетами
starPlanetData.forEach(data => {

    let star = starsMap.get(data.starId);
    let planet = planetsMap.get(data.planetId);
    if (star && planet) {
        star.add(planet[0]);
    }

})

// Связываем планеты со спутниками
planetSatelliteData.forEach(data => {

    let planet = planetsMap.get(data.planetId);
    let satellite = satellitesMap.get(data.satelliteId);
    if (planet && satellite) {
        planet[1].add(satellite);
    }
})

// --- Солнце ---
function createStar(id, name, description, size, textureURL, distance, speed, position) {

    let starSize = Number((size / 55700).toFixed(4));
    if(starSize < 1){
        starSize = 4;
    }
    const geometry = new THREE.SphereGeometry(starSize, 32, 32); // Геометрия сферы для Солнца
    // Используем MeshBasicMaterial, так как Солнце само является источником света и не требует внешнего освещения
    const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(textureURL) // Накладываем текстуру Солнца
    });

    const star = new THREE.Mesh(geometry, material);
    const starObj = new THREE.Object3D();
    star.name = name; // Присваиваем имя для идентификации при клике
    star.userData = { description }; // Сохраняем описание в userData
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
    orbit.rotation.x = -0.5 * Math.PI; // Поворачиваем орбиту, чтобы она была в плоскости XY
    starObj.add(orbit);
    starsMap.set(id, star);
    scene.add(starObj); // Добавляем Солнце на сцену
    stars.push({ star, starObj, speed });
}


function createPlanet(id, name, description, size, textureURL, distance, speed, position) {
    // Создание геометрии и материала для планеты
    const planetSize = Number((size / 12700).toFixed(4));
    const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({ // MeshStandardMaterial реагирует на свет
        map: textureLoader.load(textureURL)
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = name; // Присваиваем имя для идентификации при клике
    planet.userData = { description }; // Сохраняем описание в userData

    // Создаем пустой Object3D, который будет вращаться вокруг Солнца.
    // Сама планета будет дочерним элементом этого объекта.
    const planetObj = new THREE.Object3D();
    planetObj.add(planet);

    // Устанавливаем начальное положение планеты на ее орбите
    // let planetDistance = distance / 1500000;
    let a = 1000000;
    let b = 500000;

    while(a < distance){
        a = a + 5000000;
        b = b + 1200;
    }
    console.log(b);
    let planetDistance = distance / b;
    let starSize = 0;
    
    // Устанавливаем начальное положение планеты на ее орбите
    starPlanetData.forEach(data => {
        if (data.planetId == id) {
            let star = starsMap.get(data.starId);
            console.log(star);
            starSize = star.geometry.parameters.radius;
        }

    })
    planetDistance = planetDistance + starSize;
    planet.position.x = planetDistance;
    planetObj.rotation.y = position;
    // Создание видимой орбиты в виде тонкого кольца
    const orbitGeometry = new THREE.RingGeometry(planetDistance - 0.1, planetDistance + 0.1, 512);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI; // Поворачиваем орбиту, чтобы она была в плоскости XY
    planetObj.add(orbit);

    planetsMap.set(id, [planetObj, planet]);

    // Сохраняем данные о планете для использования в цикле анимации
    planets.push({ planet, planetObj, speed });

    return { planet, planetObj };
}

function createSatellite(id, name, description, size, textureURL, distance, speed, position) {
    // Создание геометрии и материала для планеты
    const satelliteSize = Number((size / 12700).toFixed(4));
    const geometry = new THREE.SphereGeometry(satelliteSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({ // MeshStandardMaterial реагирует на свет
        map: textureLoader.load(textureURL)
    });
    const satellite = new THREE.Mesh(geometry, material);
    satellite.name = name; // Присваиваем имя для идентификации при клике
    satellite.userData = { description }; // Сохраняем описание в userData

    // Создаем пустой Object3D, который будет вращаться вокруг Солнца.
    // Сама планета будет дочерним элементом этого объекта.
    const satelliteObj = new THREE.Object3D();
    satelliteObj.add(satellite);

    let planetSize = 0;
    // Устанавливаем начальное положение планеты на ее орбите
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
    // Создание видимой орбиты в виде тонкого кольца
    const orbitGeometry = new THREE.RingGeometry(satelliteDistance - 0.1, satelliteDistance + 0.1, 512);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI; // Поворачиваем орбиту, чтобы она была в плоскости XY
    satelliteObj.add(orbit);

    satellitesMap.set(id, satelliteObj);

    // Сохраняем данные о планете для использования в цикле анимации
    satellites.push({ satellite, satelliteObj, speed });
}


// --- Кольца Сатурна ---
const ringGeometry = new THREE.RingGeometry(20, 25, 32);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = -0.5 * Math.PI; // Поворачиваем кольца так же, как и орбиты

if (saturn) {
    saturn.planet.add(ring); // Добавляем кольца к объекту Сатурна
}

// --- Создание кнопок для планет ---
const planetButtonsContainer = document.getElementById('planet-buttons');
if (planetButtonsContainer) {
    planets.forEach(({ planet }) => {
        const button = document.createElement('button');
        button.textContent = planet.name;
        button.addEventListener('click', () => {
            // Имитируем клик по планете
            handlePlanetClick(planet);
        });
        planetButtonsContainer.appendChild(button);
    });
    stars.forEach(({ star }) => {
        const button = document.createElement('button');
        button.textContent = star.name;
        button.addEventListener('click', () => {
            // Имитируем клик по планете
            handlePlanetClick(star);
        });
        planetButtonsContainer.appendChild(button);
    });
}

let targetPlanet = null; // Переменная для отслеживания выбранной планеты

// --- Анимация и обработка событий ---
const clock = new THREE.Clock(); // Создаем часы один раз
// Функция animate будет вызываться на каждом кадре
function animate() {
    requestAnimationFrame(animate); // Запрашиваем следующий кадр анимации

    TWEEN.update(); // Обновляем анимации TWEEN

    const delta = clock.getDelta(); // Получаем время с прошлого кадра

    // --- Camera Movement Controls ---
    const moveSpeed = 100.0; // Adjust for desired speed
    // Only allow free-fly camera movement when not focused on a planet
    if (targetPlanet === null) {
        if (keyState['w']) {
            camera.translateZ(-moveSpeed * delta);
        }
        if (keyState['s']) {
            camera.translateZ(moveSpeed * delta);
        }
        if (keyState['a']) {
            camera.translateX(-moveSpeed * delta);
        }
        if (keyState['d']) {
            camera.translateX(moveSpeed * delta);
        }
    }

    satellites.forEach(s => {
        if (s.speed == 0) {
            s.satelliteObj.rotation.y = 0;
        } else {
            s.satelliteObj.rotation.y += delta * Math.PI * 2 / (s.speed / 8); // Вращение по орбите
        }
        s.satellite.rotation.y += 0.0001; // Вращение вокруг своей оси
    });

    // Обновляем вращение каждой планеты вокруг Солнца
    stars.forEach(s => {
        if (s.speed == 0) {
            s.starObj.rotation.y = 0;
        } else {
            s.starObj.rotation.y += delta * Math.PI * 2 / (s.speed / 8); // Вращение по орбите
        }
        s.star.rotation.y += 0.0001; // Вращение вокруг своей оси
    });

    planets.forEach(p => {
        if (p.speed == 0) {
            p.planetObj.rotation.y = 0;
        } else {
            p.planetObj.rotation.y += delta * Math.PI * 2 / (p.speed / 8); // Вращение по орбите
        }
        p.planet.rotation.y += 0.001; // Вращение вокруг своей оси
    });

    if (targetPlanet) {
        const targetPosition = new THREE.Vector3();
        targetPlanet.getWorldPosition(targetPosition);
        controls.target.copy(targetPosition);
    }

    controls.update(); // Обновляем контроллер камеры (для плавного затухания)
    // Вместо renderer.render, мы вызываем composer.render, чтобы применить эффекты постобработки
    composer.render();
}

animate(); // Запускаем цикл анимации

// --- Обработчик изменения размера окна ---
// Эта функция будет вызываться каждый раз, когда пользователь изменяет размер окна браузера
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Обновляем соотношение сторон камеры
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Обновляем размер рендерера и композера эффектов
    renderer.setSize(width, height);
    composer.setSize(width, height);
});

// --- Keyboard controls for camera movement ---
window.addEventListener('keydown', (event) => {
    keyState[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
    keyState[event.key.toLowerCase()] = false;
});


// --- Raycasting для выбора планеты кликом ---
const raycaster = new THREE.Raycaster(); // Создает "луч" из камеры в точку клика
const mouse = new THREE.Vector2();     // Вектор для хранения координат мыши

// --- UI Creation (Dynamic) ---
// Проверяем, существует ли панель, если нет — создаем её динамически
let infoPanel = document.getElementById('info-panel');
let planetName = document.getElementById('planet-name');
let planetDescription = document.getElementById('planet-description');
let closeBtn = document.getElementById('close-btn');

if (!infoPanel) {
    infoPanel = document.createElement('div');
    infoPanel.id = 'info-panel';
    // Стили для позиционирования в нижнем левом углу
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
        display: 'none', // Скрыто по умолчанию
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

    // Обновляем ссылки на элементы
    planetName = document.getElementById('planet-name');
    planetDescription = document.getElementById('planet-description');
    closeBtn = document.getElementById('close-btn');
}

// Обработчик для кнопки закрытия информационной панели
closeBtn.addEventListener('click', () => {
    infoPanel.style.display = 'none';
    targetPlanet = null; // Сбрасываем цель
    // Анимация возврата камеры к Солнцу
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
    targetPlanet = selectedPlanet; // Устанавливаем новую цель

    // Обновляем текст в информационной панели
    planetName.textContent = selectedPlanet.name;
    planetDescription.textContent = selectedPlanet.userData.description;
    // Показываем панель
    infoPanel.style.display = 'block';

    // Анимация камеры
    const targetPosition = new THREE.Vector3();
    selectedPlanet.getWorldPosition(targetPosition); // Получаем мировую позицию планеты


    const cameraOffset = new THREE.Vector3(0, selectedPlanet.geometry.parameters.radius * 2, selectedPlanet.geometry.parameters.radius * 4);
    const newCameraPosition = targetPosition.clone().add(cameraOffset);

    new TWEEN.Tween(camera.position)
        .to(newCameraPosition, 1500) // 1.5 секунды на анимацию
        .easing(TWEEN.Easing.Quadratic.InOut) // Плавное начало и конец
        .start();

    // Анимация точки, на которую смотрит камера
    new TWEEN.Tween(controls.target)
        .to(targetPosition, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();


}

// Обработчик клика мыши по всему окну
window.addEventListener('click', (event) => {
    // Игнорируем клик, если клик был по навигации, инфо-панели или кнопкам
    if (event.target.closest('nav') || event.target.closest('#info-panel') || event.target.closest('#planet-buttons')) {
        return;
    }

    // Преобразуем координаты клика мыши в нормализованные координаты устройства (от -1 до +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Устанавливаем луч raycaster'а из камеры в направлении курсора мыши
    raycaster.setFromCamera(mouse, camera);

    // Получаем массив объектов, которые пересек луч (true - для рекурсивной проверки дочерних объектов)
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Если луч пересек какую-либо объект с именем (т.е. одну из наших планет)
    if (intersects.length > 0 && intersects[0].object.name) {
        handlePlanetClick(intersects[0].object);
    }
});
