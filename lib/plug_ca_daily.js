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
 *  Enables Daily.co service for this CA.
 *
 *
 * @module caf_daily/plug_ca_daily
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;
const json_rpc = require('caf_transport').json_rpc;
const assert = /**@ignore @type {typeof import('assert')} */(require('assert'));
const ROOM_NAME_LENGTH = 24;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {
            info: {
                isKeyAPI: false,
                rooms: []
            }
        }; // handleMethod:string, keyAPI:string, info:dailyInfoT

        const processReply = (id, result) => {
            if (that.state.handleMethod) {
                /* Response processed in a separate transaction, i.e.,
                   using a fresh message */
                const m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                 that.state.handleMethod,
                                                 id, result);
                $.ca.__ca_process__(m, function(err) {
                    err && $.ca.$.log &&
                        $.ca.$.log.error('Got handler exception ' +
                                         myUtils.errToPrettyStr(err));
                });
            } else {
                const logMsg = 'Ignoring reply ' + JSON.stringify(result);
                $.ca.$.log && $.ca.$.log.debug(logMsg);
            }
        };

        // transactional ops
        const target = {
            async createRoomImpl(id, name, expires) {
                try {
                    const res = await $._.$.daily.createRoom(that.state.keyAPI,
                                                             name, expires);
                    // Need to update room url here
                    that.state.info.rooms.forEach((room) => {
                        if (room.name === name) {
                            room.url = res.url;
                        }
                    });
                    processReply(id, [null, myUtils.clone(that.state.info)]);
                } catch (err) {
                    processReply(id, [err]);
                }
                return [];
            },
            async deleteRoomImpl(id, name) {
                try {
                    await $._.$.daily.deleteRoom(that.state.keyAPI, name);
                    processReply(id, [null, myUtils.clone(that.state.info)]);
                } catch (err) {
                    processReply(id, [err]);
                }
                return [];
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.getDailyInfo = function() {
            return myUtils.clone(that.state.info);
        };

        that.setKeyAPI = function(key) {
            that.state.keyAPI = key;
            that.state.info.isKeyAPI = !!key;
        };

        that.setHandleReplyMethod = function(methodName) {
            that.state.handleMethod = methodName;
        };

        that.createRoom = function(duration) {
            assert(that.state.keyAPI, 'Missing API key');
            const name = myUtils.randomString(ROOM_NAME_LENGTH);
            const id = `create_${name}`;
            const expires = Math.floor((Date.now() + 1000*duration)/1000);
            that.state.info.rooms.push({expires, name});
            that.__ca_lazyApply__('createRoomImpl', [id, name, expires]);
            return id;
        };

        that.deleteRoom = function(name) {
            assert(that.state.keyAPI, 'Missing API key');
            const filterRoom = (rooms) => {
                return rooms.filter((room) => room.name !== name);
            };
            const id = `delete_${name}`;
            that.state.info.rooms = filterRoom(that.state.info.rooms);
            that.__ca_lazyApply__('deleteRoomImpl', [id, name]);
            return id;
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
