
import { html } from 'lit'
import { api } from '@converse/headless/core'
import { until } from 'lit/directives/until.js'
import { repeat } from 'lit/directives/repeat.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { getStandaloneButtons, getDropdownButtons } from 'shared/chat/utils.js'
import tplMucHead from '../../src/plugins/muc-views/templates/muc-head.js'

/**
 * Clones the Peertube buttons, and add them in the template.
 */
function getPeertubeButtons () {
  // searching original buttons in the DOM, and if found:
  // - clone a button in ConverseJS, that triggers the original button click event.
  // Note: original buttons will be hidden behind ConverseJS, so no need to hide them.

  const buttonsContainer = document.querySelector(
    '.peertube-plugin-livechat-buttons.peertube-plugin-livechat-buttons-open'
  )
  if (!buttonsContainer) { return html`` }

  const buttons = []
  buttonsContainer.childNodes.forEach(button => {
    try {
      if (button.offsetParent === null) {
        // Trick to detect if element is hidden
        // (see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.offsetParent)
        return
      }

      buttons.push(button)
    } catch (err) {
      console.error(err)
    }
  })

  if (!buttons.length) {
    return html``
  }

  return html`
    ${repeat(buttons, (node) => html`
      <a
        href="#"
        class="${
          // adding original classes
          node.className
        }"
        @click=${() => {
          // triggering the original button click
          node.click()
        }}
      >
        ${unsafeHTML(node.innerHTML)}
      </a>
    `)}
  `
}

export default (el) => {
  if (!api.settings.get('livechat_mini_muc_head')) {
    // original Template (this settings comes with livechatMiniMucHeadPlugin)
    return html`${tplMucHead(el)}`
  }

  // Custom template, with only the buttons.
  const subjectHidden = true
  const headingButtonsPromise = el.getHeadingButtons(subjectHidden)
  return html`
    <div class="livechat-mini-muc-bar-buttons">
      ${getPeertubeButtons()}
      ${until(getStandaloneButtons(headingButtonsPromise), '')}
      ${until(getDropdownButtons(headingButtonsPromise), '')}
    </div>
  `
}