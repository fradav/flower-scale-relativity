import { Engine } from './Engine'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GameEntity } from './GameEntity'
import { PerspectiveCamera } from 'three'

export class Camera implements GameEntity {
  public instance!: PerspectiveCamera
  private controls!: OrbitControls

  constructor(private engine: Engine) {
    this.initCamera()
    this.initControls()
  }

  private initCamera() {
    this.instance = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.instance.position.z = 5
    this.instance.position.y = 2
    this.engine.scene.add(this.instance)
  }

  private initControls() {
    this.controls = new OrbitControls(this.instance, this.engine.canvas)
    this.controls.update()
  }

  resize() {
    this.instance.aspect = this.engine.sizes.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
