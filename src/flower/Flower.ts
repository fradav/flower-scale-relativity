import { HemisphereLight, DirectionalLight, Vector3, Color } from 'three'
import { Engine } from '../engine/Engine'
import { FlowerStruct } from './FlowerStruct'
import { Experience } from '../engine/Experience'
import { Resource } from '../engine/Resources'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { PencilLinesPass } from './PencilLinesPass'

export class Flower implements Experience {
  resources: Resource[] = []
  lightversion = true
  width = 1063/2
  height = 1654/2

  constructor(private engine: Engine) {}

  init() {
    const camera = this.engine.camera.instance
    const renderer = this.engine.renderEngine.composer.renderer
    const scene = this.engine.scene
    const composer = this.engine.renderEngine.composer
    // camera.aspect = this.width / this.height;
    // renderer.setSize(  this.width/2, this.height/2);
    camera.updateProjectionMatrix()

    const hemisphereLight = new HemisphereLight(0x7a3114, 0x48c3ff, 16)

    scene.add(hemisphereLight)
    scene.background = new Color(0xfffffff)
    let directionalLight = new DirectionalLight(0xffffff, 12)
    scene.add(directionalLight)

    directionalLight.position.set(-10, 10, -5)
    camera.translateOnAxis(new Vector3(-0.1, 0.15, -1), 2.5)
    //    this.engine.camera.instance.setViewOffset(2560,1600,350,150,1800,1200)

    camera.aspect = this.width / this.height
    camera.updateProjectionMatrix()
    renderer.setSize(this.width, this.height)
    renderer.render(scene, camera)

    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    const renderPass = new RenderPass(scene, camera)
    const pencilLines = new PencilLinesPass({
      width: this.engine.sizes.width,
      height: this.engine.sizes.height,
      scene: scene,
      camera: camera,
    })
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms['resolution'].value.set(1 / innerWidth, 1 / innerHeight)
    effectFXAA.renderToScreen = true

    composer.addPass(renderPass)
    composer.addPass(pencilLines)
    composer.addPass(effectFXAA)

    new FlowerStruct(this.engine)
  }

  resize() {
    this.engine.camera.instance.aspect = this.width / this.height
    this.engine.camera.instance.updateProjectionMatrix()
    this.engine.renderEngine.composer.renderer.setSize(this.width, this.height)
    this.engine.renderEngine.composer.renderer.render(this.engine.scene, this.engine.camera.instance)

    // this.engine.camera.instance.aspect = window.innerWidth / window.innerHeight;
    // this.engine.camera.instance.updateProjectionMatrix();
    // this.engine.renderEngine.composer.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  update() {
    // this.engine.renderEngine.composer.render()
  }
}
