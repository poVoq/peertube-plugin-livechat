import type { RegisterServerOptions } from '@peertube/peertube-types'
import { getCurrentProsody } from './host'
import { getAPIKey } from '../../apikey'
import { getProsodyDomain } from '../config/domain'
const got = require('got')

interface ProsodyRoomDesc {
  jid: string
  localpart: string
  name: string
  lang: string
  description: string
  lasttimestamp?: number
}

/**
 * Lists existing chatrooms.
 * @param options Peertube server options
 * @returns List of chat rooms on the Prosody server
 */
async function listProsodyRooms (options: RegisterServerOptions): Promise<ProsodyRoomDesc[]> {
  const logger = options.peertubeHelpers.logger

  const currentProsody = getCurrentProsody()
  if (!currentProsody) {
    throw new Error('It seems that prosody is not binded... Cant list rooms.')
  }

  // Requesting on localhost, because currentProsody.host does not always resolves correctly (docker use case, ...)
  const apiUrl = `http://localhost:${currentProsody.port}/peertubelivechat_manage_rooms/list-rooms`
  logger.debug('Calling list rooms API on url: ' + apiUrl)
  const rooms = await got(apiUrl, {
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + await getAPIKey(options),
      host: currentProsody.host
    },
    responseType: 'json',
    resolveBodyOnly: true
  })

  return rooms
}

/**
 * Update room metadata on the Prosody server.
 * Uses an API provided by mod_http_peertubelivechat_manage_rooms.
 *
 * Note: could be called without verifying that the room exists.
 * On the Prosody side, non existing rooms will be ignored.
 * @param options Peertube server options
 * @param channelId associated channelId
 * @param jid Room JID (can be only the local part, or the local + domain)
 * @param data Data to update
 * @returns true if success
 */
async function updateProsodyRoom (
  options: RegisterServerOptions,
  channelId: number | string,
  jid: string,
  data: {
    name: string
  }
): Promise<boolean> {
  const logger = options.peertubeHelpers.logger

  const currentProsody = getCurrentProsody()
  if (!currentProsody) {
    throw new Error('It seems that prosody is not binded... Cant update room.')
  }

  if (!jid.includes('@')) {
    jid = jid + '@room.' + await getProsodyDomain(options)
  }

  logger.debug('Calling update room for ' + jid)

  // Requesting on localhost, because currentProsody.host does not always resolves correctly (docker use case, ...)
  const apiUrl = `http://localhost:${currentProsody.port}/peertubelivechat_manage_rooms/update-room`
  const apiData = {
    jid,
    name: data.name
  }
  try {
    logger.debug('Calling update room API on url: ' + apiUrl + ', with data: ' + JSON.stringify(apiData))
    const result = await got(apiUrl, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + await getAPIKey(options),
        host: currentProsody.host
      },
      json: apiData,
      responseType: 'json',
      resolveBodyOnly: true
    })

    logger.debug('Update room API response: ' + JSON.stringify(result))
  } catch (err) {
    // We consider it is not very bad if the metadata are not correctly updated.
    // Nothing too important.
    logger.error(`Failed to update room: ' ${err as string}`)
    return false
  }
  return true
}

export {
  listProsodyRooms,
  updateProsodyRoom
}