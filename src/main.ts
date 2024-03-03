import './style.scss'
import { Engine } from './engine/Engine'
import { Flower } from './flower/Flower'

new Engine({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement,
  experience: Flower,
  info: {
    github: 'https://github.com/fradav/flower-scale-relativity',
    link: 'https://fradav.perso.math.cnrs.fr/Matière solaire.html',
    description: 'Hommage à Laurent Nottale. Simulation de la morphogenèse des fleurs à partir de la théorie de la relativité d’échelle.',
    documentTitle: 'Des Fleurs pour Schrödinger, Hommage à Laurent Nottale',
    title: 'Des Fleurs pour Schrödinger',
  }
})
