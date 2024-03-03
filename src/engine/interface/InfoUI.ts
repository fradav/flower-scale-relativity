import './info.scss'
import githubLogo from '../../../assets/github.svg'
import linkLogo from '../../../assets/link-solid.svg'

export type InfoConfig = {
  github?: string
  link?: string
  description?: string
  title?: string
  documentTitle?: string
}

export class InfoUI {
  constructor(config: InfoConfig = {}) {
    if (config.documentTitle) {
      document.title = config.documentTitle
    }

    const container = document.createElement('div')
    container.classList.add('info-container')
    container.insertAdjacentHTML(
      'beforeend',
      `
${config.title ? `<h1>${config.title}</h1>` : ''}
${
  config.description
    ? `<div class="description">
  <p>${config.description}</p>
 </div>`
    : ``
}
<div class="social-container">
${
  config.link
    ? `<a href="${config.link}" class="social-button" target="_blank">
    <img src="${linkLogo}" alt="link Logo to the description" />
  </a>`
    : ``
}
${
  config.github
    ? `<a href="${config.github}" class="social-button" target="_blank">
    <img src="${githubLogo}" alt="Github logo linking to repository" />
  </a>`
    : ``
}
</div>
    `
    )
    document.body.prepend(container)
  }
}
