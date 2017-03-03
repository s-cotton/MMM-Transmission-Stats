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
        debug: false,
    },

    components: {
        models: {},
        collections: {},
        views: {},    
    },

    updateModels: [],
    updateViews: [],
    allUpdatesView: null,
    
    // Subclass start method.
    start: function () {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        if (this.config.debug) Log.info(this.name + " config: ", this.config);

        var self = this;
        
        this.setupModels();
        this.setupViews();

        self.requestLatestStatistics();
        
        this.updater = setInterval(function(){
            self.requestLatestStatistics();
        }, this.config.updateInterval );

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

    addViewConfig: function(data){        
        return _.extend({},data,{
            showCumulative: this.config.showCumulative
        });
    },

    setupViews: function(){
        var self = this;
        this.components.views.singleUpdate = Backbone.View.extend({
            tagName: "tr",
            className: "transmission-single-activity normal",
            template: MMMTransmissionStats.Templates.update,
            initialize: function(){
                this.on("postrender", this.postRender, this);
            },
            render: function(){
                this.$el.html( this.template( self.addViewConfig(this.model.toJSON()) ) );
                return this;
            },
            postRender: function(){
                this.$el.find('.slide-image img').on('error',function(e){
                    $(this).attr('src', self.file("images/no-image.png"));
                });
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
                this.updateViews = [];

                this.collection.each(function(update){
                    that.updateViews.push( new self.components.views.singleUpdate({
                        model: update
                    }));
                });
            },
            render: function(){
                var that = this;
                this.$el.html( this.template( self.addViewConfig({}) ) );
                _(this.updateViews).each(function(updateView){
                    that.$el.find('tbody').append( updateView.render().$el );
                });
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