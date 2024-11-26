import { useEffect } from "react";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function App() {
  useEffect(() => {
    const scene = new THREE.Scene();

    //texture Loader
    const textureLoader = new THREE.TextureLoader();
    //adding textures
    const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
    const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
    const moonTexture = textureLoader.load("/textures/2k_moon.jpg");
    const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
    const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
    const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
    const backgroundTexture = textureLoader.load(
      "/textures/8k_stars_milky_way.jpg"
    );

    const backgroundCubeMap = new THREE.CubeTextureLoader()
      .setPath("/textures/cubeMap/")
      .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

    scene.background = backgroundCubeMap;

    //creating mesh geometries
    const sphereGeometry = new THREE.SphereGeometry(1, 70, 70);

    //creating mesh materials
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: mercuryTexture,
    });
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
    const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });

    //creating meshes
    const sun = new THREE.Mesh(sphereGeometry, sunMaterial);

    //modifying properties of the meshes
    sun.scale.setScalar(5);

    //adding meshes and groups to the scene
    scene.add(sun);

    const planets = [
      {
        name: "Mercury",
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        material: mercuryMaterial,
        moons: [],
      },
      {
        name: "Earth",
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthMaterial,
        moons: [
          {
            name: "Moon",
            radius: 0.3,
            distance: 3,
            speed: 0.015,
          },
        ],
      },
      {
        name: "Venus",
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        material: venusMaterial,
        moons: [],
      },
      {
        name: "Mars",
        radius: 0.7,
        distance: 25,
        speed: 0.003,
        material: marsMaterial,
        moons: [
          {
            name: "Phobos",
            radius: 0.1,
            distance: 2,
            speed: 0.02,
          },
          {
            name: "Deimos",
            radius: 0.2,
            distance: 3,
            speed: 0.015,
            color: 0xffffff,
          },
        ],
      },
    ];

    const createPlanet = (planet) => {
      const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
      planetMesh.scale.setScalar(planet.radius);
      planetMesh.position.x = planet.distance;
      scene.add(planetMesh);
      return planetMesh;
    };
    const createMoon = (moon, planetMesh) => {
      const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
      moonMesh.scale.setScalar(moon.radius);
      moonMesh.position.x = moon.distance;
      return moonMesh;
    };

    const planetMeshes = planets.map((planet) => {
      const planetMesh = createPlanet(planet);
      planet.moons.forEach((moon) => {
        const moonMesh = createMoon(moon, planetMesh);
        planetMesh.add(moonMesh);
      });
      return planetMesh;
    });

    // lights initialization
    const ambientLight = new THREE.AmbientLight("white", 0.2);
    const pointLight = new THREE.PointLight("#FFD580", 2000);
    pointLight.position.set(0, 0, 0);

    //adding lights to the scene
    scene.add(ambientLight);
    scene.add(pointLight);

    //add axis helper to the scene
    const axishelper = new THREE.AxesHelper(2);
    scene.add(axishelper);

    //creating camera
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    camera.position.z = 70;
    camera.position.y = 5;
    camera.aspect = window.innerWidth / window.innerHeight;

    const canvas = document.querySelector("#threejs");

    //renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    //controls
    const control = new OrbitControls(camera, canvas);
    control.enableDamping = true;
    // control.autoRotate = true;

    control.update();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    //clock generation

    //renderloop
    const renderloop = () => {
      planetMeshes.forEach((planet, index) => {
        planet.rotation.y += planets[index].speed;
        planet.position.x =
          Math.sin(planet.rotation.y) * planets[index].distance;
        planet.position.z =
          Math.cos(planet.rotation.y) * planets[index].distance;

        planet.children.forEach((moon, moonIndex) => {
          moon.rotation.y += planets[index].moons[moonIndex].speed;
          moon.position.x =
            Math.sin(moon.rotation.y) *
            planets[index].moons[moonIndex].distance;
          moon.position.z =
            Math.cos(moon.rotation.y) *
            planets[index].moons[moonIndex].distance;
        });
      });
      control.update();
      renderer.render(scene, camera);
      requestAnimationFrame(renderloop);
    };
    renderloop();
  }, []);

  return (
    <div>
      <canvas id="threejs"></canvas>
    </div>
  );
}

export default App;
