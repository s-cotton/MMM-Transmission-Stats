/* global Log, Module, moment, config */
/* Magic Mirror
 * Module: MMM-Transmission-Stats
 *
 * By Stephen Cotton
 * MIT Licensed.
 */

//var Module, Log, moment, config, Log, moment, document;

Module.register("MMM-Transmission-Stats", {

     // Default module config.
    defaults: {

        servers: [
            {
                host: "localhost",
                port: "9091",
                username: "",
                password: "",

                serverLabel: "Transmission",
                serverIcon:  "server"   
            }
        ],
        
        updateInterval: 5000,
        showCumulative: false,
        showTotals: false,
        debug: false,
    },

    totals: {
        totalActive     : 0,
        totalInactive   : 0,
        totalRateUp     : 0,
        totalRateDown   : 0,
        totalUp         : 0,
        totalDown       : 0,
    },

    components: {
        models: {},
        collections: {},
        views: {},    
    },

    updateModels: [],
    updateViews: [],
    allUpdatesView: null,

    suspend: function(){
        this.stopUpdateTimer();
    },

    resume: function(){
        this.startUpdateTimer();
    },
    
    // Subclass start method.
    start: function () {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        if (this.config.debug) Log.info(this.name + " config: ", this.config);

        var self = this;
        
        this.setupModels();
        this.setupViews();

        this.requestLatestStatistics();
        this.startUpdateTimer();
    },

    startUpdateTimer: function(){
        var self = this;
        if( moment().valueOf() - this.lastUpdate > this.config.updateInterval ){
            this.requestLatestStatistics();
        }
        this.updater = setInterval(function(){
            self.requestLatestStatistics();
        }, this.config.updateInterval );
    },

    stopUpdateTimer: function(){
        clearInterval(this.updater);
    },

    setupModels: function(){
        this.components.models.update = Backbone.Model.extend({
            defaults: {
                totalActive     : 0,
                totalInactive   : 0,
                totalRateUp     : 0,
                totalRateDown   : 0,
                totalUp         : 0,
                totalDown       : 0,
                serverLabel     : 0,
                serverIcon      : 0,
            },
            initialize: function(){

            }
        });
    },

    addViewConfig: function(data,addTotals){        
        return _.extend({},
            data,
            {
                config: {
                    showCumulative: this.config.showCumulative,
                    showTotals: this.config.showTotals    
                }                
            },
            ( this.config.showTotals && addTotals ? { totals: this.formatTotals() } : {} )
        );
    },

    formatTotals: function(){
        return {
            totalActive     : this.totals.totalActive   > 0 ? this.totals.totalActive                             : '--',
            totalInactive   : this.totals.totalInactive > 0 ? this.totals.totalInactive                           : '--',
            totalRateUp     : this.totals.totalRateUp   > 0 ? this.formatBytes( this.totals.totalRateUp, true )   : '--',
            totalRateDown   : this.totals.totalRateDown > 0 ? this.formatBytes( this.totals.totalRateDown, true ) : '--',
            totalUp         : this.totals.totalUp       > 0 ? this.formatBytes( this.totals.totalUp, false )      : '--',
            totalDown       : this.totals.totalDown     > 0 ? this.formatBytes( this.totals.totalDown, false )    : '--',
        };
    },

    setupViews: function(){
        var self = this;
        this.components.views.emptyUpdate = Backbone.View.extend({
            tagName: "tr",
                className: "transmission-single-activity normal",
                template: MMMTransmissionStats.Templates.emptyUpdate,
                render: function(){
                this.$el.html( this.template( self.addViewConfig({}, false) ) );
                return this;
            }
        });
        this.components.views.singleUpdate = Backbone.View.extend({
            tagName: "tr",
            className: "transmission-single-activity normal",
            template: MMMTransmissionStats.Templates.update,
            render: function(){
                this.$el.html( this.template( self.addViewConfig(this.model.toJSON(), false) ) );
                return this;
            }
        });
        this.components.collections.updates = Backbone.Collection.extend({
            model: self.components.models.update
        })
        this.components.views.updateTable = Backbone.View.extend({
            tagName: "div",
            className: 'transmission-activity',
            template: MMMTransmissionStats.Templates.updateTable,
            initialize: function(){
                var that = this;
                self.updateViews = [];

                this.collection.each(function(update){
                    self.updateViews.push( new self.components.views.singleUpdate({
                        model: update
                    }));
                });
            },
            render: function(){
                var that = this;
                this.$el.html( this.template( self.addViewConfig({},true) ) );
                if( self.updateViews.length ){
                    _(self.updateViews).each(function(updateView){
                        that.$el.find('tbody').append( updateView.render().$el );
                    });    
                } else {
                    var emptyUpdate = new self.components.views.emptyUpdate();
                    that.$el.find('tbody').append( emptyUpdate.render().$el );
                }
                
                return this;
            }
        });
    },

    getScripts: function() {
        return [
            'https://code.jquery.com/jquery-2.2.3.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.runtime.min.js',
            this.file('templates.js')
        ];
    },

    getStyles: function() {
        return [
            this.file('css/main.css')
        ];
    },

    // Subclass socketNotificationReceived method.
    socketNotificationReceived: function (notification, payload) {
        if (this.config.debug) Log.info(this.name + " received a notification: " + notification, payload);
        var self = this;
        if (notification === "TRANSMISSION_STATISTICS_REFRESHED"){
            this.refreshStatistics( payload );
        }
    },

    requestLatestStatistics: function(){
        if (this.config.debug) Log.info('Transmission asking for refresh of activity');
        this.sendSocketNotification("REFRESH_TRANSMISSION_STATISTICS", this.config.servers);
    },

    refreshStatistics: function( payload ){
        if (this.config.debug) Log.info( payload );
        this.models = [];
        this.totals = {
            totalActive     : 0,
            totalInactive   : 0,
            totalRateUp     : 0,
            totalRateDown   : 0,
            totalUp         : 0,
            totalDown       : 0,
        };
        _(payload).each(function(record, record_i){
            this.models.push( new this.components.models.update( this.processStatisticRecord( record ) ));
        }, this);
        this.updateDom();
    },

    formatBytes: function(bytes,speed){
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' b';}
        else if (bytes==1)          {bytes=bytes+' b';}
        else                        {bytes='0 b'; }
        if (speed) bytes = bytes + '/s';
        return bytes;
    },

    processStatisticRecord: function(record){
        if( this.config.showTotals ){
            this.totals.totalActive   = this.totals.totalActive   + record.stats.activeTorrentCount;
            this.totals.totalInactive = this.totals.totalInactive + record.stats.pausedTorrentCount;
            this.totals.totalRateUp   = this.totals.totalRateUp   + record.stats.uploadSpeed;
            this.totals.totalRateDown = this.totals.totalRateDown + record.stats.downloadSpeed;
            this.totals.totalUp       = this.totals.totalUp       + record.stats['current-stats'].uploadedBytes;
            this.totals.totalDown     = this.totals.totalDown     + record.stats['current-stats'].downloadedBytes;
        }
        return {
            totalActive     : record.stats.activeTorrentCount > 0 ? record.stats.activeTorrentCount : '--',
            totalInactive   : record.stats.pausedTorrentCount > 0 ? record.stats.pausedTorrentCount : '--',
            totalRateUp     : record.stats.uploadSpeed > 0 ? this.formatBytes( record.stats.uploadSpeed, true ) : '--',
            totalRateDown   : record.stats.downloadSpeed > 0 ? this.formatBytes( record.stats.downloadSpeed, true ) : '--',
            totalUp         : this.formatBytes( record.stats['current-stats'].uploadedBytes, false),
            totalDown       : this.formatBytes( record.stats['current-stats'].downloadedBytes, false),
            serverLabel     : record.server.serverLabel,
            serverIcon      : record.server.serverIcon,
        };
    },

    // Override dom generator.
    getDom: function () {
        var wrapper, self;

        var updatesCollection = new this.components.collections.updates( this.models );
        var updatesView = new this.components.views.updateTable({
            collection: updatesCollection
        });

        return updatesView.render().el;
        //return '';

    },
});