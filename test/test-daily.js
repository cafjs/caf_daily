"use strict"

const hello = require('./hello/main.js');
const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-appinfo';

const CA_OWNER_1='root';
const CA_LOCAL_NAME_1='ca1'+ crypto.randomBytes(8).toString('hex');
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

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

    appInfo: function(test) {
        let s1;
        const from1 = FROM_1;
        test.expect(4);
        async.series(
            [
                function(cb) {
                    s1 = new cli.Session('ws://root-appinfo.vcap.me:3000',
                                         from1, {
                                             from : from1
                                         });
                    s1.onopen = async function() {
                        try {
                            const nginx  = await s1.getAppInfo('nginx')
                                .getPromise();
                            test.ok(nginx);
                            console.log(JSON.stringify(nginx));
                            cb(null);
                        } catch (err) {
                            test.ok(false, 'Got exception ' + err);
                            cb(err);
                        }
                    };
                },
                async function(cb) {
                    try {
                        await s1.reload().getPromise();
                        cb(null);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        cb(err);
                    }
                },
                async function(cb) {
                    // force a few cron reloads.
                    setTimeout(cb, 4000);
                },
                async function(cb) {
                    try {
                        const hue = await s1.getAppInfo('root-hellohue')
                              .getPromise();
                        test.ok(hue);
                        console.log(JSON.stringify(hue));
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
