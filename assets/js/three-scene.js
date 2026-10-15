/**
 * CLEVORISE - 3D RETRO COMPUTER SCENE
 * Optimized Three.js Stage with IntersectionObserver Battery Saver
 */

(function initThreeScene() {
  try {
  const container = document.getElementById('threejs-hero-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 520;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 1.2, 9.4);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting - Caustic Fluid & Specular Key Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const blueLight = new THREE.PointLight(0x0066ff, 3.8, 20);
  blueLight.position.set(-3, 2, 4);
  scene.add(blueLight);

  const causticLight = new THREE.PointLight(0x00d2ff, 2.4, 20);
  causticLight.position.set(4, -1, 3);
  scene.add(causticLight);

  // Retro Computer Group
  const computerGroup = new THREE.Group();
  scene.add(computerGroup);

  // Liquid Glass & Physical Materials
  const blueMat = new THREE.MeshPhysicalMaterial({
    color: 0x0066ff,
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1
  });
  
  const glassCrystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    transmission: 0.82,
    thickness: 1.4,
    transparent: true,
    opacity: 0.78,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  const liquidBlueMat = new THREE.MeshPhysicalMaterial({
    color: 0x0077ff,
    roughness: 0.12,
    transmission: 0.55,
    thickness: 1.2,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0
  });

  const creamMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    clearcoat: 0.6
  });

  const screenMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const cameraRedMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, roughness: 0.2, clearcoat: 0.8 });
  const yellowMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.2, clearcoat: 0.8 });
  const keyMat = new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, roughness: 0.3 });

  // Monitor Body (CRT)
  const monitorGeo = new THREE.BoxGeometry(3.6, 2.8, 2.4);
  const monitor = new THREE.Mesh(monitorGeo, blueMat);
  monitor.position.set(0, 0.6, 0);
  monitor.rotation.x = -0.08;
  computerGroup.add(monitor);

  // Bezel & Screen
  const bezelGeo = new THREE.BoxGeometry(2.9, 2.1, 0.1);
  const bezel = new THREE.Mesh(bezelGeo, creamMat);
  bezel.position.set(0, 0.65, 1.22);
  bezel.rotation.x = -0.08;
  computerGroup.add(bezel);

  const displayGeo = new THREE.PlaneGeometry(2.5, 1.7);
  const display = new THREE.Mesh(displayGeo, screenMat);
  display.position.set(0, 0.65, 1.28);
  display.rotation.x = -0.08;
  computerGroup.add(display);

  // Display lines (code / terminal glow)
  for (let i = 0; i < 6; i++) {
    const lineGeo = new THREE.PlaneGeometry(1.8 - (i % 3) * 0.4, 0.08);
    const lineMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x0066ff : 0x38bdf8 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(-0.2 + (i % 2) * 0.1, 1.15 - i * 0.2, 1.29);
    line.rotation.x = -0.08;
    computerGroup.add(line);
  }

  // Top Retro Webcam
  const camBoxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.7);
  const camBox = new THREE.Mesh(camBoxGeo, cameraRedMat);
  camBox.position.set(0, 2.2, -0.1);
  computerGroup.add(camBox);

  const lensGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.25, 16);
  const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, clearcoat: 1.0 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 2.2, 0.32);
  computerGroup.add(lens);

  // Keyboard Base
  const kbGroup = new THREE.Group();
  const kbBaseGeo = new THREE.BoxGeometry(3.6, 0.4, 1.8);
  const kbBase = new THREE.Mesh(kbBaseGeo, creamMat);
  kbBase.position.set(0, -1.1, 1.5);
  kbBase.rotation.x = 0.18;
  kbGroup.add(kbBase);

  // Key grid
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      const kGeo = new THREE.BoxGeometry(0.24, 0.15, 0.24);
      const kMesh = new THREE.Mesh(kGeo, (r === 3 && (c >= 3 && c <= 6)) ? blueMat : keyMat);
      kMesh.position.set(-1.4 + c * 0.31, -0.9 + (3 - r) * 0.05, 0.95 + r * 0.35);
      kMesh.rotation.x = 0.18;
      kbGroup.add(kMesh);
    }
  }
  computerGroup.add(kbGroup);

  // Floating Playful Accessories
  const floaters = [];

  // 1. Floating Cyan Memo (Translucent sticky glass)
  const memoGeo = new THREE.BoxGeometry(1.0, 1.0, 0.05);
  const memo = new THREE.Mesh(memoGeo, yellowMat);
  memo.position.set(-2.8, 2.2, 1.2);
  memo.rotation.set(0.1, 0.3, -0.2);
  scene.add(memo);
  floaters.push({ mesh: memo, speed: 1.8, rotSpeed: 0.5, baseY: 2.2, offset: 0 });

  // 2. Floating Liquid Cobalt Torus Ring (Refractive Glass)
  const ringGeo = new THREE.TorusGeometry(0.7, 0.18, 16, 32);
  const ring = new THREE.Mesh(ringGeo, liquidBlueMat);
  ring.position.set(-1.8, -1.8, 2.2);
  ring.rotation.set(1.2, 0.2, 0);
  scene.add(ring);
  floaters.push({ mesh: ring, speed: 2.2, rotSpeed: 0.8, baseY: -1.8, offset: 1.5 });

  // 3. Floating Sapphire Trackball
  const sphereGeo = new THREE.SphereGeometry(0.5, 24, 24);
  const ball = new THREE.Mesh(sphereGeo, yellowMat);
  ball.position.set(2.6, -1.4, 2.0);
  scene.add(ball);
  floaters.push({ mesh: ball, speed: 2.5, rotSpeed: 1.2, baseY: -1.4, offset: 3.0 });

  // 4. Crystal Glass Floating Pixel Cubes
  for (let p = 0; p < 4; p++) {
    const pixelGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const pixelMat = p % 2 === 0 ? glassCrystalMat : liquidBlueMat;
    const pixel = new THREE.Mesh(pixelGeo, pixelMat);
    const px = (p % 2 === 0 ? -1 : 1) * (2.2 + p * 0.6);
    const py = 0.5 + (p * 0.7);
    pixel.position.set(px, py, 1.0);
    scene.add(pixel);
    floaters.push({ mesh: pixel, speed: 1.4 + p * 0.3, rotSpeed: 1.0, baseY: py, offset: p * 1.1 });
  }

  // Mouse Interaction (Normalized coordinates)
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    if (e.clientY >= rect.top - 200 && e.clientY <= rect.bottom + 200) {
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
  }, { passive: true });

  // Responsive Resize
  function onResize() {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 520;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Animation Loop with Visibility Optimization
  let clock = new THREE.Clock();
  let isVisible = true;
  let animationFrameId = null;

  function renderLoop() {
    if (!isVisible) return;
    animationFrameId = requestAnimationFrame(renderLoop);
    const t = clock.getElapsedTime();

    targetRotY = (mouseX || 0) * 0.35;
    targetRotX = -(mouseY || 0) * 0.2;
    computerGroup.rotation.y += (targetRotY - computerGroup.rotation.y) * 0.05;
    computerGroup.rotation.x += (targetRotX - computerGroup.rotation.x) * 0.05;
    computerGroup.position.y = Math.sin(t * 1.5) * 0.08;

    floaters.forEach((f) => {
      f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.offset) * 0.16;
      f.mesh.rotation.y += 0.008 * f.rotSpeed;
      f.mesh.rotation.z += 0.005 * f.rotSpeed;
    });

    renderer.render(scene, camera);
  }

  // IntersectionObserver: Pause when hero is scrolled out of viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!isVisible) {
          isVisible = true;
          renderLoop();
        }
      } else {
        isVisible = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    });
  }, { threshold: 0.05 });

  observer.observe(container);
  renderLoop();
  } catch (err) {
    // No WebGL / blocked CDN: leave the static hero in place instead of throwing
    console.warn('[CLEVORISE] 3D hero disabled:', err && err.message);
  }
})();
