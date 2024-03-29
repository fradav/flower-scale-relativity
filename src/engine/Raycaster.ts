import { EventEmitter } from './utilities/EventEmitter'
import { Engine } from './Engine'
import { Raycaster as ThreeRaycaster, Vector2 } from 'three'

export class Raycaster extends EventEmitter {
  private raycaster: ThreeRaycaster
  private pointer: Vector2

  constructor(private engine: Engine) {
    super()
    this.raycaster = new ThreeRaycaster()
    this.pointer = new Vector2()

    document.addEventListener('mousemove', (event) => {
      const x = (event.clientX / this.engine.sizes.width) * 2 - 1
      const y = -(event.clientY / this.engine.sizes.height) * 2 + 1
      this.setPointer(x, y)
      if (this.listenerCount('move')) {
        this.emit('move', this.getIntersections())
      }
    })

    document.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLCanvasElement)) return
      const point = this.mouseEventToVector2(event)
      this.setPointer(point.x, point.y)
      this.update()
      if (this.listenerCount('click')) {
        this.emit('click', this.getIntersections())
      }
    })
  }

  public update() {
    this.raycaster.setFromCamera(this.pointer, this.engine.camera.instance)
  }

  public setPointer(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
  }

  public getIntersections() {
    return this.raycaster.intersectObjects(this.engine.scene.children, true)
  }

  private mouseEventToVector2(event: MouseEvent) {
    const x = (event.clientX / this.engine.sizes.width) * 2 - 1
    const y = -(event.clientY / this.engine.sizes.height) * 2 + 1
    return new Vector2(x, y)
  }
}
