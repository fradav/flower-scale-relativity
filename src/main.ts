import './style.scss'
import { Engine } from './engine/Engine'
import { Flower } from './flower/Flower'

new Engine({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement,
  experience: Flower,
  info: {
    github: 'https://github.com/fradav/flower-scale-relativity',
    description: 'A scale relavitity simulation of a flower using Three.js and TypeScript.',
    documentTitle: 'Flower Scale Relativity',
    title: 'Flower Scale Relativity',
  }
})
