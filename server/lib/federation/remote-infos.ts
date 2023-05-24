import type { RegisterServerOptions } from '@peertube/peertube-types'
import { getBaseRouterRoute } from '../helpers'
import { canonicalizePluginUri } from '../uri/canonicalize'
import { URL } from 'url'
const got = require('got')

/**
 * This function returns remote server connection informations.
 * If these informations are not available (because we receive no ActivityPub
 * data from this remote server), we will fetch them on a dedicated url.
 *
 * This information will also be stored.
 *
 * For all remote videos that our instance federated, remote server information
 * are sent using ActivityPub.
 * But there is a case in which we need information about potentially unknown
 * servers.
 *
 * Use case:
 * - server A: our server, proposing video V
 * - server B: server that follows ours (or used to watch V, without following A)
 * - user from B connect to the B XMPP server
 * - server B has server A connection informations (got it using ActivityPub)
 * - but, when using Websocket S2S, server A needs information from B, that he never receives
 *
 * Indeed, the XMPP S2S dialback mecanism will try to connect back to
 * server A, and transmit a secret key, to ensure that all incomming connection
 * are valid.
 *
 * For more informations about dialback: https://xmpp.org/extensions/xep-0220.html
 *
 * @param options server options
 * @param remoteInstanceUrl remote instance url to check (as readed in the request header)
 * @returns true if the remote instance is ok
 */
async function remoteServerInfos (
  options: RegisterServerOptions,
  remoteInstanceUrl: string
): Promise<boolean> {
  const logger = options.peertubeHelpers.logger
  logger.debug(`remoteServerInfos: checking if we have remote server infos for host ${remoteInstanceUrl}.`)

  let url: string
  try {
    const u = new URL(remoteInstanceUrl)

    // Assuming that the path on the remote instance is the same as on this one
    // (but canonicalized to remove the plugin version)
    u.pathname = getBaseRouterRoute(options) + 'api/federation_server_infos'
    url = canonicalizePluginUri(options, u.toString(), {
      protocol: 'http',
      removePluginVersion: true
    })
  } catch (_err) {
    logger.info('remoteServerInfos: Invalid remote instance url provided: ' + remoteInstanceUrl)
    return false
  }

  try {
    logger.debug('remoteServerInfos: We must check remote server infos using url: ' + url)
    const response = await got(url, {
      method: 'GET',
      headers: {},
      responseType: 'json'
    }).json()

    if (!response) {
      logger.info('remoteServerInfos: Invalid remote server options')
      return false
    }

    // FIXME/TODO

    return true
  } catch (_err) {
    logger.info('remoteServerInfos: Can\'t get remote instance informations using url ' + url)
    return false
  }
}

export {
  remoteServerInfos
}
