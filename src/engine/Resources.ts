import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EventEmitter } from './utilities/EventEmitter'
import { LoadingManager, TextureLoader, CubeTextureLoader } from 'three'

export type Resource =
  | {
      name: string
      type: Exclude<AssetType, 'cubeTexture'>
      path: string
    }
  | {
      name: string
      type: 'cubeTexture'
      path: string[]
    }

type AssetType = 'gltf' | 'texture' | 'cubeTexture'

type Loaders = {
  gltf: GLTFLoader
  texture: TextureLoader
  cubeTexture: CubeTextureLoader
}

export class Resources extends EventEmitter {
  private loadingManager = new LoadingManager(
    () => {
      this.emit('loaded')
    },
    // @ts-ignore
    (url: string, item: number, total: number) => {
      this.emit('progress', item / total)
    },
    (url: string) => {
      console.error(`Failed to load ${url}`)
    }
  )
  private loaders!: Loaders
  public items: Record<string, any> = {}

  constructor(private readonly resources: Resource[]) {
    super()
    this.initLoaders()
    this.load()
  }

  private initLoaders() {
    this.loaders = {
      gltf: new GLTFLoader(this.loadingManager),
      texture: new TextureLoader(this.loadingManager),
      cubeTexture: new CubeTextureLoader(this.loadingManager),
    }
  }

  getItem(name: string) {
    let item = this.items[name]
    if (!item) {
      throw new Error(`Resource ${name} not found`)
    }
    return item
  }

  load() {
    if (this.resources.length === 0) {
      setTimeout(() => {
        this.emit('loaded')
      })
    }

    for (const resource of this.resources) {
      switch (resource.type) {
        case 'gltf':
          this.loaders.gltf.load(
            resource.path,
            (file) => (this.items[resource.name] = file)
          )
          break
        case 'texture':
          this.loaders.texture.load(
            resource.path,
            (file) => (this.items[resource.name] = file)
          )
          break
        case 'cubeTexture':
          this.loaders.cubeTexture.load(
            resource.path,
            (file) => (this.items[resource.name] = file)
          )
          break
      }
    }
  }
}
