
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2'; // Основная библиотека Three.js
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js'; // Управление камерой (вращение, масштабирование)
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js'; // Для создания цепочки эффектов постобработки
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js'; // Проход рендеринга, который рисует сцену
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js'; // Эффект свечения (bloom)
import { TWEEN } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/libs/tween.module.min.js';

// --- Базовая настройка сцены ---
const scene = new THREE.Scene(); // Создаем сцену, которая будет содержать все объекты

// --- Фон (Skybox) ---
// Используем TextureLoader для загрузки изображения, которое будет служить фоном
const textureLoader1 = new THREE.TextureLoader();
const texture = textureLoader1.load("/static/images/simulation_bg2.png"); // Загружаем панораму Млечного Пути

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

const starData = [
    { id: 1, name: 'Sun', description: 'This is Sun', size: 28.8, textureURL: '/static/images/textures/sunmap2.jpg', distance: 0, speed: 0, position: 0 }
]

// --- Данные о планетах ---
const planetData = [
    { id: 1, name: 'Mercury', description: 'The smallest planet in our solar system and nearest to the Sun.', size: 0.6, textureURL: '/static/images/textures/mercurymap.jpg', distance: 39, speed: 88, positionX: 45 },
    { id: 2, name: 'Venus', description: 'The second planet from the Sun, known for its thick, toxic atmosphere.', size: 1.5, textureURL: '/static/images/textures/venusmap.jpg', distance: 72, speed: 224, positionX: 90 },
    { id: 3, name: 'Earth', description: 'Our home planet, the only place known to harbor life.', size: 1.6, textureURL: '/static/images/textures/earthmap1k.jpg', distance: 100, speed: 365, positionX: 135 },
    { id: 4, name: 'Mars', description: 'The "Red Planet," known for its reddish appearance and polar ice caps.', size: 0.8, textureURL: '/static/images/textures/mars_1k_color.jpg', distance: 150, speed: 687, positionX: 180 },
    { id: 5, name: 'Jupiter', description: 'The largest planet in our solar system, a gas giant with a Great Red Spot.', size: 17.4, textureURL: '/static/images/textures/jupitermap.jpg', distance: 520, speed: 4333, positionX: 210 },
    { id: 6, name: 'Saturn', description: 'Known for its extensive ring system, the second-largest planet.', size: 14.5, textureURL: '/static/images/textures/saturnmap.jpg', distance: 954, speed: 10759, positionX: 255 },
    { id: 7, name: 'Uranus', description: 'An ice giant with a unique tilt, making it appear to rotate on its side.', size: 6.3, textureURL: '/static/images/textures/uranusmap.jpg', distance: 1919, speed: 30685, positionX: 45 },
    { id: 8, name: 'Neptune', description: 'The most distant planet from the Sun, a dark, cold, and windy ice giant.', size: 6.1, textureURL: '/static/images/textures/neptunemap.jpg', distance: 3007, speed: 60190, positionX: 180 }
];

const satelliteData = [
    { id: 1, name: 'Moon', description: 'Moon', size: 0.5, textureURL: '/static/images/textures/mercurymap.jpg', distance: 5, speed: 88, positionX: 45 }
]

const starPlanetData = [
    { starId: 1, planetId: 1 },
    { starId: 1, planetId: 2 },
    { starId: 1, planetId: 3 },
    { starId: 1, planetId: 4 },
    { starId: 1, planetId: 5 },
    { starId: 1, planetId: 6 },
    { starId: 1, planetId: 7 },
    { starId: 1, planetId: 8 }
]

const planetSatelliteData = [
    { planetId: 3, satelliteId: 1 }
]

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
    star.add(planet[0]);
})

// Связываем планеты со спутниками
planetSatelliteData.forEach(data => {
    let planet = planetsMap.get(data.planetId);
    let satellite = satellitesMap.get(data.satelliteId);
    planet[1].add(satellite);
})

// --- Солнце ---
function createStar(id, name, description, size, textureURL, distance, speed, position) {

    const geometry = new THREE.SphereGeometry(size, 32, 32); // Геометрия сферы для Солнца
    // Используем MeshBasicMaterial, так как Солнце само является источником света и не требует внешнего освещения
    const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(textureURL) // Накладываем текстуру Солнца
    });
    const star = new THREE.Mesh(geometry, material);
    const starObj = new THREE.Object3D();
    star.name = name; // Присваиваем имя для идентификации при клике
    star.userData = { description }; // Сохраняем описание в userData

    starObj.add(star);
    star.position.x = distance;
    starObj.rotation.y = position;
    starsMap.set(id, star);
    scene.add(starObj); // Добавляем Солнце на сцену
    stars.push({ star, starObj, speed });
}

function createPlanet(id, name, description, size, textureURL, distance, speed, position) {
    // Создание геометрии и материала для планеты
    const geometry = new THREE.SphereGeometry(size, 32, 32);
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
    //sun.add(planetObj);

    // Устанавливаем начальное положение планеты на ее орбите
    planet.position.x = distance;
    planetObj.rotation.y = position;
    // Создание видимой орбиты в виде тонкого кольца
    const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 512);
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
    const geometry = new THREE.SphereGeometry(size, 32, 32);
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

    // Устанавливаем начальное положение планеты на ее орбите
    satellite.position.x = distance;
    satelliteObj.rotation.y = position;
    // Создание видимой орбиты в виде тонкого кольца
    const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 512);
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
planets.forEach(({ planet }) => {
    const button = document.createElement('button');
    button.textContent = planet.name;
    button.addEventListener('click', () => {
        // Имитируем клик по планете
        handlePlanetClick(planet);
    });
    planetButtonsContainer.appendChild(button);
});

let targetPlanet = null; // Переменная для отслеживания выбранной планеты

// --- Анимация и обработка событий ---
const clock = new THREE.Clock(); // Создаем часы один раз
// Функция animate будет вызываться на каждом кадре
function animate() {
    requestAnimationFrame(animate); // Запрашиваем следующий кадр анимации

    TWEEN.update(); // Обновляем анимации TWEEN

    const delta = clock.getDelta(); // Получаем время с прошлого кадра

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

// --- Raycasting для выбора планеты кликом ---
const raycaster = new THREE.Raycaster(); // Создает "луч" из камеры в точку клика
const mouse = new THREE.Vector2();     // Вектор для хранения координат мыши

// Получаем доступ к элементам информационной панели из HTML
const infoPanel = document.getElementById('info-panel');
const planetName = document.getElementById('planet-name');
const planetDescription = document.getElementById('planet-description');
const closeBtn = document.getElementById('close-btn');

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
    // Игнорируем клик, если клик был по навигации или кнопке закрытия
    if (event.target.closest('nav') || event.target.closest('#close-btn') || event.target.closest('#planet-buttons')) {
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