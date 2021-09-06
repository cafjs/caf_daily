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
 * Calls a Daily.co service.
 *
 * @module caf_daily/plug_daily
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;
const fetch = require('node-fetch');
const URL_PREFIX = 'https://api.daily.co/v1/rooms';

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.create($, spec);

        $._.$.log && $._.$.log.debug('New Daily.co plug');

        const getRoom = async function(keyAPI, name) {
            const meta = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keyAPI}`
            };
            const response = await fetch(`${URL_PREFIX}/${name}`, {
                headers: meta
            });
            const data = await response.json();
            return data && data.url ? data : null;
        };

        that.createRoom = async function(keyAPI, name, expires) {
            // make idempotent
            const data = await getRoom(keyAPI, name);
            if (data) {
                return data;
            } else {
                const meta = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keyAPI}`
                };
                const response = await fetch(`${URL_PREFIX}`, {
                    headers: meta,
                    method: 'post',
                    body: JSON.stringify({
                        name: name,
                        properties: {exp: expires, eject_at_room_exp: true}
                    })
                });
                const data = await response.json();
                if (!data.url) {
                    const err = new Error('Cannot create room');
                    err['data'] = data;
                    throw err;
                }
                return data;
            }
        };

        that.deleteRoom = async function(keyAPI, name) {
            const meta = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keyAPI}`
            };
            const response = await fetch(`${URL_PREFIX}/${name}`, {
                headers: meta,
                method: 'delete'
            });
            const data = await response.json();
            if (data && data.error) {
                /* Do not return the error to make idempotent.
                   Note that network connectivity errors throw, and this error
                   is due to deleting twice.*/
                $._.$.log && $._.$.log.debug('Delete room error: ' +
                                             JSON.stringify(data));
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
