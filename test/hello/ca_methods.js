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
"use strict";

exports.methods = {
    async __ca_init__() {
        this.$.log.debug("++++++++++++++++Calling init");
        this.$.daily.setHandleReplyMethod('__ca_handle__');
        return [];
    },

    async __ca_handle__(id, response) {
        this.$.log.debug(`handle: id ${id} and ` +
                         `response ${JSON.stringify(response)}`);
        return [];
    },

    async setKeyAPI(key) {
        this.$.daily.setKeyAPI(key);
        return [];
    },

    async createRoom(duration) {
        return [null, this.$.daily.createRoom(duration)];
    },

    async deleteRoom(name) {
        return  [null, this.$.daily.deleteRoom(name)];

    },

    async getState() {
        return [null, this.$.daily.getDailyInfo()];
    }
};
