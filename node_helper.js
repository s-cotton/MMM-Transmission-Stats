/* global require, module */
/* Magic Mirror
 * Module: MMM-Transmission-Stats
 *
 * By Stephen Cotton
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const Transmission = require('transmission');
const _ = require('underscore');

module.exports = NodeHelper.create({
  transmissionClients: {},

  currentStats: {},
  statsCount: 0,

  start: function () {
    this.started = false;
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'CONFIG' && this.started == false) {
      this.config = payload;
      console.log("Transmission :: Config received", this.config.servers );
      const self = this;
      

      if( this.config.servers.length ){
        for( var server_i in this.config.servers ){
          var thisServer = this.config.servers[ server_i ];
          this.transmissionClients[ server_i ] = new Transmission({
              port: thisServer.port,
              host: thisServer.host,
              username: thisServer.username,
              password: thisServer.password
          });
          this.currentStats[ server_i ] = {};
        }
        this.started = true;
        this.updateStats();
      }
    } else if (notification === 'REFRESH_TRANSMISSION_STATISTICS' && this.started == true) {
      this.updateStats();
    }
  },

  updateStats: function(){
    console.log("Transmission :: Updating Stats");
    var self = this;
    var output = [];
    _(this.config.servers).each(function(server, server_i){
      this.transmissionClients[ server_i ].sessionStats(function(err, result){
          self.statsCount = self.statsCount + 1;
          if(err){
              console.log("Transmission :: Stat Error ("+server.serverName+")");
          } else {
            if( this.config.debug ) console.log( "Transmission :: Successful Stat Grab", server, result);
            self.storeStats( server_i, server, result);
          }
          self.checkSendStats();
      });
    }, this);
  },

  storeStats: function(offset, server, stats){
    if( this.config.debug ) console.log("Transmission :: Storing Stat");
    this.currentStats[ offset ] = {
      server: server,
      stats: stats
    }
  },

  checkSendStats: function(){
    if( this.config.debug ) console.log("Transmission :: Checking Stat Length " + this.statsCount + " == " + this.config.servers.length );
    if( this.statsCount == this.config.servers.length ){
      this.statsCount = 0;
      if( this.config.debug ) console.log('Transmission :: Sending Statistics', this.currentStats);
      this.sendSocketNotification("TRANSMISSION_STATISTICS_REFRESHED", this.currentStats);
    }
  },

  log: function(message, object) {
        // Log if config is message or in debug mode
        if (!this.config || this.config.debug) {
            if (object) {
                console.log(message, object);
            } else {
                console.log(message);
            }
        }
    },

});
