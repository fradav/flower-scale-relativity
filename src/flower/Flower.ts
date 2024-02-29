import {
  HemisphereLight,
  DirectionalLight,
  Vector3,
  Color,
  Vector2,
} from 'three'
import { Engine } from '../engine/Engine'
import { FlowerStruct } from './FlowerStruct'
import { Experience } from '../engine/Experience'
import { Resource } from '../engine/Resources'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
// import { CustomOutlinePass } from './CustomOutlinePass'
import { PencilLinesPass } from './PencilLinesPass'

export class Flower implements Experience {
  resources: Resource[] = []
  // width = 1063
  // height = 1654

  constructor(private engine: Engine) {}

  init() {
    const camera = this.engine.camera.instance
    const renderer = this.engine.renderEngine.composer.renderer
    const scene = this.engine.scene
    const composer = this.engine.renderEngine.composer
    // camera.aspect = this.width / this.height;
    // renderer.setSize(  this.width/2, this.height/2);
    camera.updateProjectionMatrix();

    const hemisphereLight = new HemisphereLight(0x7a3114, 0x48c3ff, 16)

    scene.add(hemisphereLight)
    scene.background = new Color(0xfffffff)
    let directionalLight = new DirectionalLight(0xffffff, 12)
    scene.add(directionalLight)

    directionalLight.position.set(-10, 10, -5)
    camera.translateOnAxis(new Vector3(-0.1, 0.15, -1), 2.5)
//    this.engine.camera.instance.setViewOffset(2560,1600,350,150,1800,1200)

    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const renderPass = new RenderPass(scene,camera)
    composer.addPass(renderPass)

    const pencilLines = new PencilLinesPass({
      width: this.engine.sizes.width,
      height: this.engine.sizes.height,
      scene: scene,
      camera: camera,
    })
    composer.addPass(pencilLines)

    // const customOutline = new CustomOutlinePass(
    //   new Vector2(this.engine.sizes.width, this.engine.sizes.height),
    //   scene,
    //   camera
    // )
    // composer.addPass(customOutline)

    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms['resolution'].value.set(
      1 / innerWidth,
      1 / innerHeight
    )
    effectFXAA.renderToScreen = true
    composer.addPass(effectFXAA)

    // const effectSMAA = new SMAAPass(this.width * 16, this.height + 16)
    // effectSMAA.renderToScreen = true
    // composer.addPass(effectSMAA)

    new FlowerStruct(this.engine)
  }

  resize() {
    // this.engine.camera.instance.aspect = window.innerWidth / window.innerHeight;
    // this.engine.camera.instance.updateProjectionMatrix();

    // this.engine.renderEngine.composer.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  update() {
    // this.engine.renderEngine.composer.render()
  }
}
