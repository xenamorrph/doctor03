"use strict";

var ob = {

};

(function(ob){
    if(typeof window.ymap != 'undefined') return;

    //ob.api = ob.api ? ob.api : '';
    //ob.center = ob.center ? ob.center : [];
    //ob.zoom = ob.zoom ? ob.zoom : 15;

    window.ymap = {
        api: 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;loadByRequire=1',
        loadDelay: null,
        ready: false,
        _instances: [],
        _status: 0,
        _busy: false,
        init: function(params){
            //if(typeof params != 'object' || !params.length){
            if(typeof params != 'object'){
                console.log('Invalid parametrs!');
                return;
            }
            this._params(params);

            // если api не загружено, грузим
            if(!this._status) this._api();
            else this._map();
        },
        get: function(){
            console.log(this._instances[0]);
            if(typeof this._instances[0].map != 'undefined')
                return this._instances[0].map;
            return false;
        },
        status: function(){
            return this._status;
        },
/*        refresh: function(){
            this._instances[0].callback(this._instances[0].map);
        },*/
        _params: function(params){
            var self = this,
                instance = {};

            instance.id = params.selector.replace(/#/, '');
            instance.element = document.getElementById(params.selector);
            instance.points = params.points;
            instance.callback = params.callback;
            instance.status = 0;

            if(typeof self._instances[0] == 'undefined'){
                self._instances[0] = instance;
            }
        },
        _api: function(){
            var self = this,
                js;
            // api загружено
            if(self._status) return;
            // загрузка уже была запущена
            if(self._busy) return;

            self._busy = true;

            js = document.createElement('script');
            js.type = 'text/javascript';
            js.src = self.api;
            js.onload = js.onreadystatechange = function(){
                self.loadDelay = setInterval(function(){
                    if(typeof ymaps !== 'undefined' && typeof ymaps.Map == 'function'){
                        clearInterval(self.loadDelay);
                        self._status = 1;
                        self._busy = false;
                        ymaps.load(self._map.bind(self));
                    }
                }, 100);
            }

            document.body.appendChild(js);
        },
        _map: function(){
            var self = this,
                map,
                layer;
            // загрузка уже была запущена
            if(self._busy) return;
            self._busy = true;

            map = new ymaps.Map(self._instances[0].id, {
                center: [55.825754, 37.498120],
                zoom: 15
            });

            var layer = map.layers.get(0).get(0);

            self._waitForTilesLoad(layer).then(function(){
                self._instances[0].map = map;
                self._instances[0].callback(map);
            });
        },
        _getTileContainer: function(layer){
            for(var k in layer){
                if(layer.hasOwnProperty(k)){
                    if(
                        layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer
                        || layer[k] instanceof ymaps.layer.tileContainer.DomContainer
                    ){
                        return layer[k];
                    }
                }
            }
            return null;
        },
        _waitForTilesLoad: function(layer){
            var self = this;
            return new ymaps.vow.Promise(function (resolve, reject) {

                var tc = self._getTileContainer(layer),
                    readyAll = true;

                tc.tiles.each(function (tile, number) {
                    if (!tile.isReady()) {
                        readyAll = false;
                    }
                });

                if (readyAll) {
                    resolve();
                } else {
                    tc.events.once("ready", function() {
                        resolve();
                    });
                }
            });
        },
        _getCenterBounds: function(bounds){
            var R = 6371,
                dLat = this.deg2rad(bounds[1][0]-bounds[0][0]),
                dLon = this.deg2rad(bounds[0][1]-bounds[1][1]); 

            var a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c;

            return d;
        },
        _deg2rad: function(deg){
            return deg * (Math.PI/180);
        }
    }

})(ob)
