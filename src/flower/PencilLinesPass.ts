import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass'
import { PencilLinesMaterial } from './PencilLinesMaterial'
import {
  Scene,
  Camera,
  WebGLRenderTarget,
  WebGLRenderer,
  Vector2,
  MeshNormalMaterial,
  RGBAFormat,
  HalfFloatType,
  NearestFilter,
} from 'three'

export class PencilLinesPass extends Pass {
  fsQuad: FullScreenQuad
  material: PencilLinesMaterial
  normalBuffer: WebGLRenderTarget
  normalMaterial: MeshNormalMaterial

  scene: Scene
  camera: Camera

  constructor({
    width,
    height,
    scene,
    camera,
  }: {
    width: number
    height: number
    scene: Scene
    camera: Camera
  }) {
    super()

    this.scene = scene
    this.camera = camera

    this.material = new PencilLinesMaterial()
    this.fsQuad = new FullScreenQuad(this.material)

    const normalBuffer = new WebGLRenderTarget(width, height)

    normalBuffer.texture.format = RGBAFormat
    normalBuffer.texture.type = HalfFloatType
    normalBuffer.texture.minFilter = NearestFilter
    normalBuffer.texture.magFilter = NearestFilter
    normalBuffer.texture.generateMipmaps = false
    normalBuffer.stencilBuffer = false
    this.normalBuffer = normalBuffer

    this.normalMaterial = new MeshNormalMaterial()

    this.material.uniforms.uResolution.value = new Vector2(width, height)
  }

  dispose() {
    this.material.dispose()
    this.fsQuad.dispose()
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget
  ) {
    renderer.setRenderTarget(this.normalBuffer)
    const overrideMaterialValue = this.scene.overrideMaterial

    this.scene.overrideMaterial = this.normalMaterial
    renderer.render(this.scene, this.camera)
    this.scene.overrideMaterial = overrideMaterialValue

    this.material.uniforms.uNormals.value = this.normalBuffer.texture
    this.material.uniforms.tDiffuse.value = readBuffer.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }
}
