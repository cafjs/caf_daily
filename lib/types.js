
/**
 * @global
 * @typedef {Object | Array | string | number | null | boolean} jsonType
 *
 */

/**
 * @global
 * @typedef {Object} roomInfoType
 * @property {number} expires Expiration timestamp in seconds since 1970.
 * @property {string} name The room name.
 * @property {string} url The URL for the room.
 */

/**
 * @global
 * @typedef {Object} dailyInfoType
 * @property {boolean} isKeyAPI True if the service key has been configured.
 * @property {Array.<roomInfoType>} rooms Info for current rooms.
*/
