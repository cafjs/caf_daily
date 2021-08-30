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
        this.state.pulses = 0;
        return [];
    },
    async __ca_pulse__() {
        this.state.pulses = this.state.pulses + 1;
        this.$.log.debug('<<< Calling Pulse>>>' + this.state.pulses);
        return [];
    },

    async getAppInfo(app) {
        try {
            return [null, this.$.appInfo.getAppInfo(app)];
        } catch (err) {
            console.log('getAppInfo FAIL:' + err);
            return [err];
        }
    },

    async reload() {
        await this.$.appInfo.reload();
        return this.getState();
    },

    async getState() {
        return [null, this.state];
    }
};
