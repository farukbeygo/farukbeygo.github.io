const simplex = new SimplexNoise();

function App(conf) {
  conf = {
    fov: 75,
    cameraZ: 150,
    tubeRadius: 0.05,
    tubeLength: 500,
    pRadius: true,
    resY: 10,
    resX: 10,
    noiseCoef: 75,
    timeCoef: 1,
    mouseCoef: 50,
    heightCoef: 100,
    colors: [0x390009, 0xe52643, 0xeadee0, 0xffffff],
    background: 0x000000,
    ambientColor: 0x909090,
    lightIntensity: 1,
    light1Color: 0x980AF1,
    light2Color: 0x66B6EC,
    light3Color: 0xffffff,
    ...conf };


  let renderer, scene, camera, cameraCtrl;
  let width, height, cx, cy, wWidth, wHeight;
  const TMath = THREE.Math;

  let light1, light2, light3;
  let objects,noiseConf = {};
  let cscale = chroma.scale(conf.colors);

  const mouse = new THREE.Vector2();
  // const noiseInput = document.getElementById('noiseInput');
  // const heightInput = document.getElementById('heightInput');
  // const timeInput = document.getElementById('timeInput');
  // const tubeRadiusInput = document.getElementById('tubeRadiusInput');

  init();

  function init() {
    renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById(conf.el),
      antialias: true
      // alpha: true,
    });
    camera = new THREE.PerspectiveCamera(conf.fov);
    camera.position.z = conf.cameraZ;

    updateSize();
    window.addEventListener('resize', updateSize, false);

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX / width * 2 - 1;
      mouse.y = -(e.clientY / height) * 2 + 1;
    });

    initScene();
    initGui();
    animate();
  }

  function initScene() {
    scene = new THREE.Scene();
    if (conf.background) scene.background = new THREE.Color(conf.background);
    initLights();
    initObjects();
    camera.position.z = 50;
    camera.position.y = -100;
    camera.lookAt(new THREE.Vector3(0, 50, 0));
  }

  function initLights() {
    scene.add(new THREE.AmbientLight(conf.ambientColor));

    const z = 50;
    const lightDistance = 500;
    light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
    light1.position.set(0, wHeight / 2, z);
    scene.add(light1);
    light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
    light2.position.set(0, -wHeight / 2, z);
    scene.add(light2);
    light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
    light3.position.set(wWidth / 2, 0, z);
    scene.add(light3);
  }

  function initObjects() {
    updateNoise();
    const nx = Math.round(wWidth / conf.resX) + 1;
    const ny = Math.round(conf.tubeLength / conf.resY) + 1;
    objects = [];
    let tube, color;
    for (let i = 0; i < nx; i++) {
      // color = cscale(j/ny).hex();
      color = cscale(TMath.randFloat(0, 1)).hex();
      tube = new Tube(-wWidth / 2 + i * conf.resX, -wHeight / 2, conf.tubeLength, ny, conf.tubeRadius, color, noiseConf);
      objects.push(tube);
      scene.add(tube.mesh);
    }
  }

  function initGui() {
    // noiseInput.value = conf.noiseCoef;
    // heightInput.value = conf.heightCoef;
    // timeInput.value = conf.timeCoef;
    // tubeRadiusInput.value = conf.tubeRadius * 10;

    // noiseInput.addEventListener('input', e => {conf.noiseCoef = noiseInput.value;});
    // heightInput.addEventListener('input', e => {conf.heightCoef = heightInput.value;});
    // timeInput.addEventListener('input', e => {conf.timeCoef = timeInput.value;});
    // tubeRadiusInput.addEventListener('input', e => {conf.tubeRadius = tubeRadiusInput.value / 10;});
    // pRadiusInput.addEventListener('input', e => {conf.pRadius = pRadiusInput.checked;});

    // document.getElementById('trigger').addEventListener('click', e => {updateColors();});
  }

  function updateNoise() {
    noiseConf.coef = conf.noiseCoef * 0.00015;
    noiseConf.height = conf.heightCoef;
    noiseConf.time = Date.now() * conf.timeCoef * 0.000005;
    noiseConf.mouseX = mouse.x / 3;
    noiseConf.mouseY = mouse.y / 3;
    // noiseConf.mouse = (mouse.x + mouse.y) * conf.mouseCoef * 0.005;
  }

  function updateColors() {
    conf.light4Color = chroma.random().hex();
    light1.color = new THREE.Color(chroma.random().hex());
    light2.color = new THREE.Color(chroma.random().hex());
    light3.color = new THREE.Color(chroma.random().hex());
    updateCScale();
  }

  function updateCScale() {
    const color = chroma.random();
    cscale = chroma.scale([
    color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', TMath.randFloat(0, 0.3)).hex(),
    color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', 0.3 + TMath.randFloat(0, 0.4)).hex(),
    color.set('hsl.s', TMath.randFloat(0, 1)).set('hsl.l', 0.7 + TMath.randFloat(0, 0.3)).hex(),
    0xffffff]);

    for (let i = 0; i < objects.length; i++) {
      objects[i].material.color = new THREE.Color(cscale(TMath.randFloat(0, 1)).hex());
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;
    const dx = wWidth / 2;
    const dy = wHeight / 2;
    light1.position.x = Math.sin(time * 0.1) * dx;
    light1.position.y = Math.cos(time * 0.2) * dy;
    light2.position.x = Math.cos(time * 0.3) * dx;
    light2.position.y = Math.sin(time * 0.4) * dy;
    light3.position.x = Math.sin(time * 0.5) * dx;
    light3.position.y = Math.sin(time * 0.6) * dy;

    updateNoise();
    for (let i = 0; i < objects.length; i++) {
      objects[i].update(conf);
    }

    renderer.render(scene, camera);
  }

  function updateSize() {
    width = window.innerWidth;
    cx = width / 2;
    height = window.innerHeight;
    cy = height / 2;
    if (renderer && camera) {
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const wsize = getRendererSize();
      wWidth = wsize[0];
      wHeight = wsize[1];
    }
  }

  function getRendererSize() {
    const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
    const vFOV = cam.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
    const width = height * cam.aspect;
    return [width, height];
  }
}

/**
  * Custom curve
  */
function CustomCurve(x, y, l, noise) {
  THREE.Curve.call(this);
  this.x = x;this.y = y;this.l = l;
  this.noise = noise;
  this.xn = this.x * this.noise.coef;
}
CustomCurve.prototype = Object.create(THREE.Curve.prototype);
CustomCurve.prototype.constructor = CustomCurve;
CustomCurve.prototype.getPoint = function (t) {
  let y = this.y + t * this.l;
  let yn = y * this.noise.coef;
  let noise1 = simplex.noise2D(this.xn + this.noise.mouseX, yn - this.noise.time + this.noise.mouseY);
  let noise2 = simplex.noise2D(yn + this.noise.time, this.xn - this.noise.time);
  let x = this.x + noise2 * this.noise.height;
  let z = noise1 * this.noise.height;
  return new THREE.Vector3(x, y, z);
};

/**
  * Tube class
  */
class Tube {
  constructor(x, y, l, segments, radius, color, noise) {
    this.segments = segments;
    this.radialSegments = 8;
    this.radius = radius;

    this.curve = new CustomCurve(x, y, l, noise);
    this.geometry = new THREE.TubeBufferGeometry(this.curve, segments, radius, this.radialSegments, false);
    // this.material = new THREE.MeshBasicMaterial({ color });
    // this.material = new THREE.MeshLambertMaterial({ color });
    this.material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  update(conf) {
    this.radius = conf.tubeRadius;

    this.frames = this.curve.computeFrenetFrames(this.segments, false);
    // this.geometry.tangents = frames.tangents;
    // this.geometry.normals = frames.normals;
    // this.geometry.binormals = frames.binormals;

    this.pArray = this.geometry.attributes.position.array;
    this.nArray = this.geometry.attributes.normal.array;
    this.P = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    for (let i = 0; i < this.segments; i++) {
      this.updateSegment(i, conf.pRadius);
    }
    this.updateSegment(this.segments, conf.pRadius);

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
  }
  updateSegment(i, pRadius) {
    this.P = this.curve.getPointAt(i / this.segments, this.P);
    const r = pRadius ? this.radius - i * this.radius / this.segments : this.radius;
    const N = this.frames.normals[i];
    const B = this.frames.binormals[i];
    for (let j = 0; j <= this.radialSegments; j++) {
      let v = j / this.radialSegments * Math.PI * 2;
      let sin = Math.sin(v);
      let cos = -Math.cos(v);
      this.normal.x = cos * N.x + sin * B.x;
      this.normal.y = cos * N.y + sin * B.y;
      this.normal.z = cos * N.z + sin * B.z;
      this.normal.normalize();
      let index = (i * (this.radialSegments + 1) + j) * 3;
      this.nArray[index] = this.normal.x;
      this.nArray[index + 1] = this.normal.y;
      this.nArray[index + 2] = this.normal.z;
      this.pArray[index] = this.P.x + r * this.normal.x;
      this.pArray[index + 1] = this.P.y + r * this.normal.y;
      this.pArray[index + 2] = this.P.z + r * this.normal.z;
    }
  }}


App({ el: 'background' });
