/*!
 Copyright 2020 Caf.js Labs and contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

/**
 *  Proxy that allows a CA to use a Daily.co video service.
 *
 * @module caf_daily/proxy_daily
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Gets status info for Daily.co
         *
         * @return {dailyInfoType} Status info for Daily.co service.
         *
         * @memberof! module:caf_daily/proxy_daily#
         * @alias getDailyInfo
         */
        that.getDailyInfo = function() {
            return $._.getDailyInfo();
        };

        /**
         * Sets secret key for service.
         *
         * @param {string} key Secret key for the service.
         *
         * @memberof! module:caf_daily/proxy_daily#
         * @alias setKeyAPI
         */
        that.setKeyAPI = function(key) {
            $._.setKeyAPI(key);
        };

        /**
         * Sets the name of the method in this CA that will process
         * reply create/delete room messages.
         *
         * The type of the method is `async function(requestId, response)`
         *
         * where:
         *
         *  *  `requestId`: is an unique identifier to match the request.
         *  *  `response` is a tuple using the standard
         *    `[Error, dailyInfoType]` CAF.js convention.
         *
         * @param {string| null} methodName The name of this CA's method that
         *  process replies.
         *
         * @memberof! module:caf_daily/proxy_daily#
         * @alias setHandleReplyMethod
         *
         */
        that.setHandleReplyMethod = function(methodName) {
            $._.setHandleReplyMethod(methodName);
        };

        /**
         * Creates a new room.
         *
         * Results are received in a separate method invocation. If not set the
         * reply is ignored.
         *
         * @param {number=} duration Room lifespan in seconds. It defaults to
         * one hour.
         *
         * @return {string} An id to match response in handler. The id
         * format is `create_<room name>`
         *
         * @memberof! module:caf_daily/proxy_daily#
         * @alias createRoom
         */
        that.createRoom = function(duration) {
            return $._.createRoom(duration || 3600);
        };

        /**
         * Deletes a room.
         *
         * Results are received in a separate method invocation. If not set the
         * reply is ignored.
         *
         * @param {string} The name of the room to delete.
         *
         * @return {string} An id to match response in handler. The id
         * format is `delete_<room name>`.
         *
         * @memberof! module:caf_daily/proxy_daily#
         * @alias deleteRoom
         */
        that.deleteRoom = function(name) {
            return $._.deleteRoom(name);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
