'use strict';

const hello = require('./hello/main.js');
const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-daily';

const CA_OWNER_1='root';
const CA_LOCAL_NAME_1='ca1'+ crypto.randomBytes(8).toString('hex');
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

const DAILY_KEY_API = process.env['DAILY_KEY_API'];

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp: function (cb) {
       const self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown: function (cb) {
        const self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    daily: function(test) {
        let s1;
        const from1 = FROM_1;
        test.expect(7);
        let roomName = null;
        async.series(
            [
                function(cb) {
                    s1 = new cli.Session('ws://root-daily.localtest.me:3000',
                                         from1, {
                                             from : from1
                                         });
                    s1.onopen = async function() {
                        try {
                            await s1.setKeyAPI(DAILY_KEY_API).getPromise();
                            const roomId = await s1.createRoom(3600)
                                  .getPromise();
                            console.log(roomId);
                            test.ok(roomId.indexOf('create_') === 0);
                            roomName = roomId.slice(7);
                            cb(null);
                        } catch (err) {
                            test.ok(false, 'Got exception ' + err);
                            cb(err);
                        }
                    };
                },
                async function(cb) {
                    setTimeout(cb, 4000);
                },
                async function(cb) {
                    try {
                        const data = await s1.getState().getPromise();
                        test.ok(data.isKeyAPI);
                        test.ok(data.rooms[0].url &&
                                (data.rooms[0].name === roomName), 'No URL');
                        console.log(JSON.stringify(data));
                        cb(null);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        cb(err);
                    }
                },
                async function(cb) {
                    try {
                        await s1.deleteRoom(roomName).getPromise();
                        const data = await s1.getState().getPromise();
                        test.ok(data.isKeyAPI);
                        test.ok(data.rooms.length === 0, 'Not deleted');
                        console.log(JSON.stringify(data));
                        cb(null);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        cb(err);
                    }
                },
                function(cb) {
                    s1.onclose = function(err) {
                        test.ifError(err);
                        cb(null, null);
                    };
                    s1.close();
                }
            ], function(err, res) {
                test.ifError(err);
                test.done();
            });
    }

};
