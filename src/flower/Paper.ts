import { RepeatWrapping, TextureLoader, Texture, CanvasTexture, Scene } from 'three'
import { GUI } from 'lil-gui'
import { CrossHatchMaterial } from './crossHatchMaterial'

const loader = new TextureLoader()

type Paper = {
  file: string | null
  texture: Texture | null
  promise: Promise<void> | null
}

function createBlankCanvasTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 1, 1)
  }
  return new CanvasTexture(canvas)
}

const papers: Record<string, Paper> = {
  'Craft light': { file: 'Craft_Light.jpg', texture: null, promise: null },
  'Craft rough': { file: 'Craft_Rough.jpg', texture: null, promise: null },
  'Watercolor cold press': {
    file: 'Watercolor_ColdPress.jpg',
    texture: null,
    promise: null,
  },
  Parchment: { file: 'Parchment.jpg', texture: null, promise: null },
  Blank: { file: '', texture: createBlankCanvasTexture(), promise: null },
}

export async function getTexture(name: string) {
  if (papers[name].texture) {
    return papers[name].texture!
  }
  if (!papers[name].promise) {
      papers[name].promise = new Promise((resolve) => {
        loader.load(`../assets/${papers[name].file}`, (res) => {
          res.wrapS = res.wrapT = RepeatWrapping
          papers[name].texture = res
          resolve()
        })
      })
    }
  await papers[name].promise
  return papers[name].texture!
}

export const PaperParams = {
  paper: 'Blank',
}

function generateParams(gui: GUI, material: CrossHatchMaterial, scene: Scene) {
  return gui
    .add(PaperParams, 'paper', Object.keys(papers))
    .onChange(async (v: string) => {
      let res = await getTexture(v)
      material.uniforms.paperTexture.value = res
      // scene.background = res
    })
}
export { generateParams }
