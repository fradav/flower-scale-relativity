import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'
import {
  Mesh,
  Vector3,
  BoxGeometry,
  Texture,
  MeshPhysicalMaterial,
  Matrix3,
  Triangle,
  SubtractiveBlending,
  NormalBlending,
  NoBlending,
  AdditiveBlending,
} from 'three'
import { Engine } from '../engine/Engine'
import { CrossHatchMaterial, generateParams } from './crossHatchMaterial'
import {
  PaperParams,
  generateParams as generatePaperParams,
  getTexture,
} from './Paper'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'

class Tige {
  theta: number = (63 * Math.PI) / 64 // Tige
  a: number = 1 // Longueur tige
  b: number = 0.4 // base tige

  func = (r: number, rho: number, X: Vector3) => {
    let phi = rho * 2 * Math.PI
    X.x = this.a * (this.b + r) * Math.sin(this.theta) * Math.cos(phi)
    X.z = this.a * (this.b + r) * Math.sin(this.theta) * Math.sin(phi)
    X.y = this.a * r * Math.cos(this.theta)
  }
}

class Etamines {
  theta: number = Math.PI / 64
  a: number = 0.9 // Longueur
  b: number = 0.2 // base tige

  func = (r: number, rho: number, X: Vector3) => {
    let phi = - rho * 2 * Math.PI
    X.x = this.a * (this.b + (1 - r)) * r * Math.sin(this.theta) * Math.cos(phi)
    X.z = this.a * (this.b + (1 - r)) * r * Math.sin(this.theta) * Math.sin(phi)
    X.y = this.a * r * Math.cos(this.theta)
  }
}

class Petales {
  theta: number = (40 * Math.PI) / 180
  a: number = 1 // Échelle
  b: number = 0.1 // Incurvation
  c: number = 0.2 // Modulation
  d: number = -0.3 // Fermeture
  k: number = 5 // Nombre

  func = (r: number, rho: number, X: Vector3) => {
    let phi = rho * 2 * Math.PI - 2
    X.x =
      this.a *
      r *
      (1 - this.c * Math.sin(this.k * phi)) *
      Math.sin(this.theta - this.d * r * r) *
      Math.cos(phi + Math.PI / this.k)
    X.z =
      this.a *
      r *
      (1 - this.c * Math.sin(this.k * phi)) *
      Math.sin(this.theta - this.d * r * r) *
      Math.sin(phi + Math.PI / this.k)
    X.y =
      this.a *
        r *
        (1 - this.c * Math.sin(this.k * phi)) *
        Math.cos(this.theta - this.d * r * r) +
      this.b * r * r
  }
}

class Sepales {
  theta: number = (73 * Math.PI) / 180
  a: number = 0.6 // Échelle
  b: number = 0.1 // Incurvation
  c: number = 0.6 // Modulation
  k: number = 5 // Nombre

  func = (r: number, rho: number, X: Vector3) => {
    let phi = rho * 2 * Math.PI
    X.x =
      this.a *
      r *
      (1 - this.c * Math.sin(this.k * phi)) *
      Math.sin(this.theta) *
      Math.cos(phi)
    X.z =
      this.a *
      r *
      (1 - this.c * Math.sin(this.k * phi)) *
      Math.sin(this.theta) *
      Math.sin(phi)
    X.y =
      this.a *
        r *
        (1 - this.c * Math.sin(this.k * phi)) *
        Math.cos(this.theta) +
      this.b * r * r
  }
}

// const materials = [
// 	new MeshPhysicalMaterial({ color: 0xa3ef31, wireframe: true,transparent: true, opacity: 0.5}),
// 	new MeshPhysicalMaterial({ color: 0x049ef4, wireframe: true,transparent: true, opacity: 0.5}),
// 	new MeshPhysicalMaterial({ color: 0x994c00, wireframe: true,transparent: true, opacity: 0.5}),
// 	new MeshPhysicalMaterial({ color: 0x00994c, wireframe: true,transparent: true, opacity: 0.5}),
// ];

export const material = new CrossHatchMaterial({
  color: 0x808080,
  roughness: 0,
  metalness: 0,
  // side: 1,
  // opacity: 1,
  // transparent: false,
  // alphaTest: 1

  // emissive: 0x101010,
})
const materials = Array(4).fill(material)

// let started = false

function dataDownload(
  data: string | DataView | Blob,
  filename: string,
  type: string
) {
  let blob: Blob
  if (data instanceof Blob) blob = data
  else blob = new Blob([data], { type: type })
  let a = document.createElement('a')
  let url = URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export class FlowerStruct {
  tige: Tige
  etamines: Etamines
  petales: Petales
  sepales: Sepales
  engine: Engine
  boxstep: number = 100
  thickness: number = 0.0005

  constructor(engine: Engine) {
    this.engine = engine
    this.tige = new Tige()
    this.etamines = new Etamines()
    this.petales = new Petales()
    this.sepales = new Sepales()

    const exporter = new STLExporter()

    function saveSTL(name: string, scale: number) {
      let scene = engine.scene.clone(true)
      scene.scale.set(scale, scale, scale)
      scene.updateMatrixWorld(true)
      let result = exporter.parse(scene, { binary: true }) as DataView
      dataDownload(result, name + '.stl', 'application/octet-stream')
    }

    engine.debug.gui.close()
    const fleurGUI = engine.debug.gui.addFolder('Fleur')
    const fleurSave = {
      Nom: '',
      Sauvegarder: () => {
        console.log('Sauvegarder')
        // Save the current state of the flower, the camera state in a file named Nom
        // Save also an stl file of the scene
        let data = JSON.stringify({
          Nom: fleurSave.Nom,
          Tige: tigeGUI.save(),
          Étamines: etaminesGUI.save(),
          Pétales: petalesGUI.save(),
          Sépales: sepalesGUI.save(),
          Caméra: this.engine.camera.instance.position,
        })
        dataDownload(data, fleurSave.Nom + '.json', 'text/plain') // Save the data in a file

        // saveSTL(fleurSave.Nom, 40) // Save the stl file
        // save a png file

        const width = 1063
        const height = 1654
        const renderer = engine.renderEngine.composer.renderer
        const scene = engine.scene
        const camera = engine.camera.instance
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        renderer.render(scene, camera)

        requestAnimationFrame(() => {
          engine.canvas.toBlob((blob) => {
            dataDownload(blob!, fleurSave.Nom + '.png', 'image/png')
            camera.aspect = innerWidth / innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(innerWidth, innerHeight)
            renderer.render(scene, camera)
          })
        })
      },
      Charger: () => {
        console.log('Charger')
        // Load a file containing the state of the flower and the camera
        let input = document.createElement('input')
        input.type = 'file'
        input.onchange = (event) => {
          let file = (event.target as HTMLInputElement)!.files![0]
          let reader = new FileReader()
          reader.onload = (e) => {
            if (e.target === null) return
            let contents = e.target.result
            let data = JSON.parse(contents as string)
            tigeGUI.load(data.Tige)
            etaminesGUI.load(data.Étamines)
            petalesGUI.load(data.Pétales)
            sepalesGUI.load(data.Sépales)
            this.engine.camera.instance.position.copy(data.Caméra)
            this.render()
          }
          reader.readAsText(file)
        }
        input.click()
      },
    }
    fleurGUI.add(fleurSave, 'Nom')
    fleurGUI.add(fleurSave, 'Sauvegarder')
    fleurGUI.add(fleurSave, 'Charger')
    const tigeGUI = fleurGUI.addFolder('Tige')
    tigeGUI.close()
    const etaminesGUI = fleurGUI.addFolder('Étamines')
    etaminesGUI.close()
    const petalesGUI = fleurGUI.addFolder('Pétales')
    petalesGUI.close()
    const sepalesGUI = fleurGUI.addFolder('Sépales')
    sepalesGUI.close()

    // tigeGUI.add(this.tige, 'theta', 0, Math.PI)
    tigeGUI.add(this.tige, 'a', 0, 2)
    tigeGUI.add(this.tige, 'b', 0, 2)

    // etaminesGUI.add(this.etamines, 'theta', 0, Math.PI)
    etaminesGUI.add(this.etamines, 'a', 0, 2)
    etaminesGUI.add(this.etamines, 'b', 0, 2)

    // petalesGUI.add(this.petales, 'theta', 0, Math.PI)
    petalesGUI.add(this.petales, 'a', 0.1, 2)
    petalesGUI.add(this.petales, 'b', 0, 2)
    petalesGUI.add(this.petales, 'c', 0, 2)
    petalesGUI.add(this.petales, 'd', -1, 2)
    petalesGUI.add(this.petales, 'k', 0, 12, 1)

    // sepalesGUI.add(this.sepales, 'theta', 0, Math.PI)
    sepalesGUI.add(this.sepales, 'a', 0, 2)
    sepalesGUI.add(this.sepales, 'b', 0, 2)
    sepalesGUI.add(this.sepales, 'c', 0, 2)
    sepalesGUI.add(this.sepales, 'k', 0, 12, 1)

    // const papergui = engine.debug.gui.addFolder('Paper')
    // generatePaperParams(papergui, material, this.engine.scene)

    const materialgui = engine.debug.gui.addFolder('Material')
    materialgui.close()
    generateParams(materialgui, material)

    this.engine.debug.gui.onChange(() => this.render())

    getTexture(PaperParams.paper).then((res: Texture) => {
      material.uniforms.paperTexture.value = res
      // this.engine.scene.background = res
      this.render()
    })
  }
  render() {
    // Remove all meshes from the scene
    let toremove = this.engine.scene.children.filter(
      (value) => value instanceof Mesh === true
    )
    this.engine.scene.children = this.engine.scene.children.filter(
      (value) => value instanceof Mesh === false
    )
    toremove.forEach((value) => {
      ;(value as Mesh).geometry.dispose()
    })
    // const outlinepass = this.engine.renderEngine.composer.passes.filter(
    //   (value) => !(value instanceof OutlinePass)
    // )[0]
    // if (outlinepass instanceof OutlinePass) outlinepass.selectedObjects = []

    for (let i = 0; i < 4; i++) {
      let f = [this.petales, this.sepales, this.etamines, this.tige][i]
      // Pure surface rendering
      let mesh: Mesh

      // } else {
      // Morphed box surface rendering for volume effect
      let geometry = new BoxGeometry(1, 1, 1.01, this.boxstep, 1, this.boxstep)
      let positionAttribute = geometry.getAttribute('position')
      let normalAttribute = geometry.getAttribute('normal')
      let vertex = new Vector3()
      let outNormal = new Vector3()
      let upperindex = []
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i)
        if (
          vertex.y > 0 &&
          Math.abs(vertex.z) < 1.01 / 2 &&
          Math.abs(vertex.x) != 0.5
        )
          upperindex.push(i)
        let r = vertex.x + 0.5
        let rho = vertex.z + 0.5
        f.func(r, rho, vertex)
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
      }
      geometry.computeVertexNormals()
      upperindex.forEach((i) => {
        vertex.fromBufferAttribute(positionAttribute, i)
        outNormal.fromBufferAttribute(normalAttribute, i)
  vertex.add(outNormal.multiplyScalar(this.thickness))
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
      })
      geometry.computeVertexNormals()
      mesh = new Mesh(geometry, materials[i])

      if (f instanceof Tige) {
        mesh.translateY(0.05)
      }
      if (f instanceof Etamines) {
        mesh.scale.set(2, 1.2, 2)
        mesh.translateY(-0.2)
      }
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.engine.scene.add(mesh)

    }
  }
}
