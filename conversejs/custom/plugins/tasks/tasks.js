import { Collection } from '@converse/skeletor/src/collection.js'
import { ChatRoomTask } from './task'
import { initStorage } from '@converse/headless/utils/storage.js'

/**
 * A list of {@link _converse.ChatRoomTask} instances, representing all tasks associated to a MUC.
 * @class
 * @namespace _converse.ChatRoomTasks
 * @memberOf _converse
 */
class ChatRoomTasks extends Collection {
  model = ChatRoomTask
  comparator = 'order'

  initialize (models, options) {
    this.model = ChatRoomTask // don't know why, must do it again here
    super.initialize(arguments)
    this.chatroom = options.chatroom

    const id = `converse-livechat-tasks-${this.chatroom.get('jid')}`
    initStorage(this, id, 'session')

    this.on('change:order', () => this.sort())
  }
}

export {
  ChatRoomTasks
}
