import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'lil-gui'

let instance: DebugUI | null = null

export class DebugUI {
  gui!: GUI
  stats!: Stats

  constructor() {
    if (instance) {
      return this
    }

    instance = this

    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)

    this.gui = new GUI()

    // if (!window.location.search.includes('debug')) {
    //   this.gui.hide()
    //   this.stats.dom.style.display = 'none'
    // }

    window.addEventListener('keydown', (event) => {
      if (event.key === 'h') {
        if (this.gui._hidden) {
          this.gui.show()
          this.stats.dom.style.display = 'block'
        } else {
          this.gui.hide()
          this.stats.dom.style.display = 'none'
        }
      }
    })
  }

  update() {
    this.stats.update()
  }
}
