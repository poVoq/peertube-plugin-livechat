import { CustomElement } from 'shared/components/element.js'
import { api } from '@converse/headless/core'
import { tplMucTask } from './templates/muc-task'
import { __ } from 'i18n'

import './styles/muc-tasks.scss'

export default class MUCTaskView extends CustomElement {
  static get properties () {
    return {
      model: { type: Object, attribute: true },
      edit: { type: Boolean, attribute: false }
    }
  }

  async initialize () {
    this.edit = false
    if (!this.model) {
      return
    }

    this.listenTo(this.model, 'change', () => this.requestUpdate())
  }

  render () {
    return tplMucTask(this, this.model)
  }

  async saveTask (ev) {
    ev?.preventDefault?.()

    const name = ev.target.name.value.trim()

    if ((name ?? '') === '') { return }

    try {
      this.querySelectorAll('input[type=submit]').forEach(el => {
        el.setAttribute('disabled', true)
        el.classList.add('disabled')
      })

      const task = this.model
      task.set('name', name)
      task.set('description', ev.target.description.value.trim())
      await task.saveItem()

      this.edit = false
    } catch (err) {
      console.error(err)
    } finally {
      this.querySelectorAll('input[type=submit]').forEach(el => {
        el.removeAttribute('disabled')
        el.classList.remove('disabled')
      })
    }
  }

  async deleteTask (ev) {
    ev?.preventDefault?.()

    // eslint-disable-next-line no-undef
    const i18nConfirmDelete = __(LOC_task_delete_confirm)

    // FIXME: when tasks are in a modal, api.confirm replaces the modal. This is not ok.
    // const result = await api.confirm(i18nConfirmDelete)
    const result = confirm(i18nConfirmDelete)
    if (!result) { return }

    try {
      await this.model.deleteItem()
    } catch (err) {
      api.alert(
        'error', __('Error'), [__('Error')]
      )
    }
  }

  async toggleEdit () {
    this.edit = !this.edit
    if (this.edit) {
      await this.updateComplete
      const input = this.querySelector('.task-name input[name="name"]')
      if (input) {
        input.focus()
        // Placing cursor at the end:
        input.selectionStart = input.value.length
        input.selectionEnd = input.selectionStart
      }
    }
  }
}

api.elements.define('livechat-converse-muc-task', MUCTaskView)
