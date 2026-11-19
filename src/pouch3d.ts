// The pouch as a live 3D model. It is the same shape as the Blender model behind the home page render:
// the numbers and formulas below are carried over from that script. 1 unit = 1 inch.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const W = 2.75, H = 4.25, D = 0.75   // pouch width, height, packed depth
const K = 0.12                       // how much the outline pulls in at the corners
const ZIP_X = W / 2 - 0.3            // the zipper runs down the front, 0.3 in from the right edge
const ZIP_LEN = H - 0.7
const UZ = ZIP_X / (W / 2)
const Y_PIN = ZIP_LEN / 2 - 0.3      // top stop: the two tapes are joined above this
const SY0 = ZIP_LEN / 2 - 0.42       // slider, closed
const SY1 = -ZIP_LEN / 2 + 0.38      // slider, fully open
const G_MAX = 0.6                    // widest gap between the tapes
const L_FULL = Y_PIN - SY1
const L_SHARE = 0.62, R_SHARE = 0.38 // how the gap is split between the left and right tape
const LIFT = 0.07                    // how far the edges of the opening rise
const BAND_Y0 = -0.7, BAND_Y1 = 0    // the black band

const thickness = (u: number, v: number) => (D / 2) * (Math.max(0, 1 - Math.abs(u) ** 9) * Math.max(0, 1 - Math.abs(v) ** 7)) ** 0.22
const surfaceZ = (x: number, y: number) => thickness(Math.max(-1, Math.min(1, (2 * x) / W)), Math.max(-1, Math.min(1, (2 * y) / H)))
const zline = (y: number) => UZ * (1 - K * ((2 * y) / H) ** 10) * (W / 2)
const fall = (q: number) => (q < 1 ? 0.5 * (1 + Math.cos(Math.PI * q)) : 0)
const smooth = (q: number) => q * q * (3 - 2 * q)
const lin = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)

export type Pose = { open: number; yaw: number; pitch: number }
export type Pouch3D = { set: (pose: Pose) => void; resize: (w: number, h: number) => void; dispose: () => void }

// A sheet of points on the front of the pouch that moves with the opening.
type Skin = { geo: THREE.BufferGeometry; base: Float32Array; side: Int8Array; rigid: boolean; normals: boolean }

export function createPouch3D(canvas: HTMLCanvasElement): Pouch3D {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.environmentIntensity = 0.16
  // Same camera as the render: 23 in back, long lens. The view is sized by resize().
  const camera = new THREE.PerspectiveCamera(12, 1, 10, 40)
  camera.position.set(0, 0, 23)
  const key = new THREE.DirectionalLight(0xffffff, 0.85)
  key.position.set(-7, 6, 12)
  const fill = new THREE.DirectionalLight(0xffffff, 0.2)
  fill.position.set(8, -6, 10)
  scene.add(key, fill)

  const vinyl = new THREE.MeshPhysicalMaterial({ color: 0x2a2b30, roughness: 0.42, clearcoat: 0.18, clearcoatRoughness: 0.25 })
  const liner = new THREE.MeshBasicMaterial({ color: 0x0b0b0d, side: THREE.BackSide })
  const band = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
  const tape = new THREE.MeshStandardMaterial({ color: 0x121318, roughness: 0.75, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })
  const teeth = new THREE.MeshStandardMaterial({ color: 0x1a1b20, roughness: 0.35 })
  const metal = new THREE.MeshStandardMaterial({ color: 0xb4b4ba, metalness: 1, roughness: 0.3, envMapIntensity: 5 })
  const card = new THREE.MeshBasicMaterial({ color: 0xcfc8bc })

  const pouch = new THREE.Group()
  pouch.rotation.order = 'XYZ' // pitch is applied after yaw, so up-down drags always tip toward or away from us
  scene.add(pouch)
  const skins: Skin[] = []

  // Build a grid sheet from `at(i, j)` -> x, y, z. `side`: -1 left of the zipper, +1 right, 0 does not move.
  function sheet(nx: number, ny: number, at: (i: number, j: number) => [number, number, number], material: THREE.Material | THREE.Material[], side: number, flip = false, rigid = false) {
    const pos = new Float32Array((nx + 1) * (ny + 1) * 3)
    const uv = new Float32Array((nx + 1) * (ny + 1) * 2)
    for (let i = 0; i <= nx; i++)
      for (let j = 0; j <= ny; j++) {
        const k = i * (ny + 1) + j
        pos.set(at(i, j), k * 3)
        uv.set([i / nx, j / ny], k * 2)
      }
    const idx: number[] = []
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const a = i * (ny + 1) + j, b = (i + 1) * (ny + 1) + j, c = b + 1, d = a + 1
        if (flip) idx.push(a, c, b, a, d, c)
        else idx.push(a, b, c, a, c, d)
      }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    const mats = Array.isArray(material) ? material : [material]
    for (const m of mats) pouch.add(new THREE.Mesh(geo, m))
    if (side !== 0) skins.push({ geo, base: pos, side: new Int8Array(pos.length / 3).fill(side), rigid, normals: true })
    return geo
  }

  // Body: front face in two pieces that part at the zipper, and a back face.
  const NV = 60
  const face = (us: number[], sign: number) => (i: number, j: number): [number, number, number] => {
    const u = us[i], v = -1 + (2 * j) / NV
    return [u * (1 - K * v ** 10) * (W / 2), v * (1 - K * u ** 10) * (H / 2), sign * thickness(u, v)]
  }
  sheet(110, NV, face(lin(-1, UZ, 110), 1), [vinyl, liner], -1)
  sheet(24, NV, face(lin(UZ, 1, 24), 1), [vinyl, liner], 1)
  sheet(90, NV, face(lin(-1, 1, 90), -1), vinyl, 0, true)

  // Seam welt round the edge.
  const rim = Array.from({ length: 160 }, (_, k) => {
    const a = (2 * Math.PI * k) / 160, c = Math.cos(a), s = Math.sin(a)
    return new THREE.Vector3((W / 2 - 0.02) * Math.sign(c) * Math.abs(c) ** (1 / 3), (H / 2 - 0.02) * Math.sign(s) * Math.abs(s) ** (1 / 3), 0)
  })
  pouch.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 320, 0.035, 8, true), vinyl))

  // Black band: printed on the front (so it parts with it), plain on the back, wrapped over the edges.
  const bandAt = (x0: (y: number) => number, x1: (y: number) => number, nb: number, sign: number) => (i: number, j: number): [number, number, number] => {
    const y = BAND_Y0 + ((BAND_Y1 - BAND_Y0) * j) / 12
    const x = x0(y) + ((x1(y) - x0(y)) * i) / nb
    return [x, y, sign * (surfaceZ(x, y) + 0.006)]
  }
  sheet(120, 12, bandAt(() => -W / 2, zline, 120, 1), band, -1)
  sheet(30, 12, bandAt(zline, () => W / 2, 30, 1), band, 1)
  sheet(140, 12, bandAt(() => -W / 2, () => W / 2, 140, -1), band, 0, true)
  for (const sx of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, BAND_Y1 - BAND_Y0, 24), band)
    edge.position.set(sx * (W / 2 - 0.02), (BAND_Y0 + BAND_Y1) / 2, 0)
    pouch.add(edge)
  }

  // CLUTCH on the band, drawn in the logo's typeface onto a small sheet that follows the front.
  const label = document.createElement('canvas')
  label.width = 1024
  label.height = 180
  const labelTex = new THREE.CanvasTexture(label)
  labelTex.colorSpace = THREE.SRGBColorSpace
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  const drawLabel = () => {
    const c = label.getContext('2d')
    if (!c) return
    c.clearRect(0, 0, label.width, label.height)
    c.font = "700 150px 'Space Grotesk', system-ui, sans-serif"
    c.fillStyle = '#fff'
    c.textBaseline = 'alphabetic'
    const letters = [...'CLUTCH'], gap = 52
    const widths = letters.map((ch) => c.measureText(ch).width)
    let x = (label.width - (widths.reduce((a, b) => a + b, 0) + gap * (letters.length - 1))) / 2
    letters.forEach((ch, i) => {
      c.fillText(ch, x, 144)
      x += widths[i] + gap
    })
    labelTex.needsUpdate = true
    render()
  }
  const LW = 1.45, LH = (LW * 180) / 1024
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 })
  sheet(40, 4, (i, j) => {
    const x = -0.17 - LW / 2 + (LW * i) / 40, y = -0.35 - LH / 2 + (LH * j) / 4
    return [x, y, surfaceZ(x, y) + 0.012]
  }, labelMat, -1)

  // Zipper tapes: one strip per side, each riding its own edge of the opening.
  const NT = 240
  for (const side of [-1, 1]) {
    const off = side < 0 ? [-0.09, 0] : [0, 0.09]
    sheet(1, NT, (i, j) => {
      const y = -ZIP_LEN / 2 + (ZIP_LEN * j) / NT
      const x = zline(y) + off[i]
      return [x, y, surfaceZ(x, y) + 0.01]
    }, tape, side, false, true)
  }

  // Coil teeth: a half-tooth on each tape; they meet where the zipper is closed.
  const N_TEETH = Math.floor(ZIP_LEN / 0.055)
  const toothY = (k: number) => -ZIP_LEN / 2 + 0.03 + (k * (ZIP_LEN - 0.06)) / (N_TEETH - 1)
  const rows = [-1, 1].map((side) => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0425, 0.032, 0.024), teeth, N_TEETH)
    pouch.add(m)
    return { side, m }
  })

  // Slider and pull tab.
  const slider = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.16, 0.06, 3, 0.02), metal)
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.38, 0.02, 3, 0.009), metal)
  tab.rotation.order = 'ZYX'
  pouch.add(slider, tab)

  // What shows through the opening: the instruction card lying on top of the contents.
  const inside = new THREE.Mesh(new THREE.BoxGeometry(W - 0.45, H - 0.6, 0.02), card)
  inside.position.set(-0.02, 0, 0.25)
  pouch.add(inside)

  const tmp = new THREE.Object3D()
  let shown = -1

  // Move everything to match how far open the pouch is (0 closed, 1 open).
  function shape(open: number) {
    if (open === shown) return
    shown = open
    const flip = Math.min(1, open / 0.16)                              // the pull tab turns over first
    const slide = open <= 0.12 ? 0 : smooth((open - 0.12) / 0.88)      // then the slider runs down
    const sy = SY0 + (SY1 - SY0) * slide
    const gap = (y: number) => {
      const top = Y_PIN, bot = sy + 0.06
      if (slide <= 0 || y >= top || y <= bot) return 0
      const L = top - bot, q = (y - bot) / L
      return G_MAX * (L / L_FULL) ** 0.85 * Math.min(1, (q ** 0.6 * (1 - q) ** 0.9) / 0.3643)
    }
    for (const s of skins) {
      const p = s.geo.attributes.position as THREE.BufferAttribute
      for (let k = 0; k < s.side.length; k++) {
        const x = s.base[k * 3], y = s.base[k * 3 + 1], z = s.base[k * 3 + 2]
        const g = gap(y)
        if (g === 0) {
          p.setXYZ(k, x, y, z)
          continue
        }
        const d = Math.abs(x - zline(y))
        // Tapes ride the edge as one piece; the face and band stretch back toward where they are sewn down.
        const dx = s.side[k] < 0 ? -L_SHARE * g * (s.rigid ? 1 : fall(d / 1.0)) : R_SHARE * g * (s.rigid ? 1 : fall(d / 0.27))
        const dz = LIFT * (g / G_MAX) * fall((s.rigid ? 0 : d) / 0.3)
        p.setXYZ(k, x + dx, y, z + dz)
      }
      p.needsUpdate = true
      s.geo.computeVertexNormals()
      s.geo.computeBoundingSphere()
    }
    for (const { side, m } of rows) {
      for (let k = 0; k < N_TEETH; k++) {
        const y = toothY(k), x0 = zline(y), g = gap(y)
        tmp.position.set(x0 + side * 0.0215 + (side < 0 ? -L_SHARE : R_SHARE) * g, y, surfaceZ(x0, y) + 0.02 + LIFT * (g / G_MAX))
        tmp.updateMatrix()
        m.setMatrixAt(k, tmp.matrix)
      }
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    }
    const sx = zline(sy), sz = surfaceZ(sx, sy)
    slider.position.set(sx, sy, sz + 0.05)
    const phi = THREE.MathUtils.degToRad(3 + flip * 174), yaw = THREE.MathUtils.degToRad(8 - 13 * flip)
    tab.rotation.set(phi, 0, yaw)
    tab.position.set(0, 0.26, 0).applyEuler(tab.rotation).add(new THREE.Vector3(sx, sy, sz + 0.04))
  }

  let pose: Pose = { open: 0, yaw: 0, pitch: 0 }
  function render() {
    shape(pose.open)
    pouch.rotation.set(pose.pitch, pose.yaw, 0)
    renderer.render(scene, camera)
  }

  // The label needs the logo's typeface; draw now, and again once it has loaded.
  drawLabel()
  document.fonts?.load("700 150px 'Space Grotesk'").then(drawLabel, () => {})

  return {
    set(next) {
      pose = next
      render()
    },
    // w, h: the canvas in CSS pixels. The view is fitted so the canvas is exactly VIEW_H inches tall at the pouch.
    resize(w, h) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(VIEW_H / 2 / 23))
      camera.updateProjectionMatrix()
      render()
    },
    dispose() {
      pmrem.dispose()
      env.dispose()
      renderer.dispose()
    },
  }
}

// The canvas shows this much around the pouch, in inches, so it has room to turn and tip.
export const VIEW_W = 3.3
export const VIEW_H = 4.8
// Seen from 70 degrees round to the right, the zipper's opening faces us.
export const OPEN_YAW = -THREE.MathUtils.degToRad(70)

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
