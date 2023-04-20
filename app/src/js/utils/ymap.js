export function ymapLoader(){



/*
    .js-loadmap data-load="onscroll" data-points="1"
    .js-loadmap data-load="onready" data-points="2"
*/


        var ymapLoader = {
            instance: {},
            apiStatus: false, /* loading | ready */
            maps: [],
            ids: [],
            points: [],
            default: {
                zoom: 17,
                coords: [55.865354, 37.585386],
            },
            interval: false,
            initInterations: 30,
            init: function(){
                this.points = mapPoints;
                if(!this.points.length) return;
                                
                this.instance = this.scroll.bind(this);
                if (window.addEventListener){
                    window.addEventListener("load", this.ready.bind(this), false);
                    //window.addEventListener("scroll", this.instance.bind(this), false);
                }
                else
                if (window.attachEvent){
                    window.attachEvent("onload", this.ready.bind(this));
                    //window.attachEvent("scroll", this.instance.bind(this));
                }
                else {
                    window.onload = this.ready.bind(this);
                    //window.onscroll = this.instance.bind(this);
                }
            },
            ready: function(){
                var maps = document.querySelectorAll('.js-ymap-lazyload');

                if(!maps.length) return;

                for(var i = 0; i < maps.length; i++){
                    var id = 'lazyloadmap-'+i;

                    maps[i].id = id;

                    this.ids.push({
                        ob: maps[i],
                        id: id,
                        event: maps[i].dataset.load ? maps[i].dataset.load : '',
                        load: false,
                        points: maps[i].dataset.points ? maps[i].dataset.points.split(',') : 'all',
                    });
                }

                for(var prop in this.ids){
                    if(this.ids[prop].event == 'onready'){
                        this.loadApi();
                        break;
                    }
                    else if(this.ids[prop].event == 'onscroll'){
                        if (window.addEventListener){
                            window.addEventListener("scroll", this.loadApiOnScroll.bind(this), false);
                        }
                        else
                        if (window.attachEvent){
                            window.attachEvent("scroll", this.loadApiOnScroll.bind(this));
                        }
                    }
                }
                this.loadApiOnScroll();

            },
            loadApiOnScroll: function(){
                var winH = (window.innerHeight > 0) ? window.innerHeight : screen.height,
                    scrollTop = document.documentElement.scrollTop || document.body && document.body.scrollTop || 0,
                    posY;

                var viewPosY2 = scrollTop + winH,
                    viewPosY1 = scrollTop - winH;

                for(var prop in this.ids){
                    if(this.ids[prop].event == 'onscroll'){
                    
                        posY = this.findPosY(this.ids[prop].ob);

                        if(viewPosY2 >= posY && viewPosY1 < posY){
                            this.loadApi();
                            if (window.removeEventListener){
                                window.removeEventListener("scroll", this.loadApiOnScroll, false);
                            }else
                            if (window.detachEvent){
                                window.detachEvent("scroll", this.loadApiOnScroll);
                            }
                            break;
                        }
                    }
                }
            },
            addElement: function(){

            },
            scroll: function(){
                var winH = (window.innerHeight > 0) ? window.innerHeight : screen.height,
                    scrollTop = document.documentElement.scrollTop || document.body && document.body.scrollTop || 0,
                    posY;

                var viewPosY2 = scrollTop + winH,
                    viewPosY1 = scrollTop - winH;

                for(var prop in this.ids){
                    if(this.ids[prop].event == 'onscroll' && !this.ids[prop].load){
                    
                        posY = this.findPosY(this.ids[prop].ob);

                        if(viewPosY2 >= posY && viewPosY1 < posY){
                            this.ids[prop].load = 1;
                            this.initMap(this.ids[prop].id);

                            break;
                        }
                    }
                }
            },
            setPoints: function(id){
                var myCol = new ymaps.GeoObjectCollection(),
                    points = [];

                for(var prop in this.ids){
                    if(this.ids[prop].id == id){
                        if(this.ids[prop].points == 'all'){
                            points = this.points;
                        }
                        else{
                            for(p in this.points){
                                if( this.ids[prop].points.indexOf(this.points[p].id) != -1){
                                    points.push(this.points[p]);
                                }
                            }
                        }
                    }
                }

                for(var i = 0; i < points.length; i++){
console.log(points[i].coords);
                    myCol.add(new ymaps.Placemark(
                        points[i].coords, 
                        points[i].options[0],
                        points[i].options[1]
                    ));
                }

                return myCol;
            },
            initMap: function(sel){
                var id = '',
                    self = this;

                sel = typeof sel == 'string' ? sel : '';

                if(sel == ''){
                    for(var prop in this.ids){
                        if(this.ids[prop].event == 'onready' && !this.ids[prop].load){
                            this.ids[prop].load = 1;
                            sel = this.ids[prop].id;
                            break;
                        }
                    }
                }
                else{
                    for(var prop in this.ids){
                        if(this.ids[prop].id == sel){
                            this.ids[prop].load = 1;
                            break;
                        }
                    }
                }

                id = sel.replace(/#/, '');

                if(id == '') return;

                var el = document.getElementById(id);

                if(el && el.dataset && !el.dataset.loaded){
                    el.dataset.loaded = 1;

                    var temp = {
                        id: sel,
                        map: new ymaps.Map(id, {
                            center: self.default.coords,
                            zoom: self.default.zoom
                        })
                    };

                    temp.map.controls.remove('zoomControl');
                    temp.map.controls.remove('searchControl');
                    temp.map.controls.remove('trafficControl');
                    temp.map.controls.remove('typeSelector');
                    temp.map.controls.remove('fullscreenControl');
                    temp.map.controls.remove('rulerControl');
                    temp.map.controls.remove('geolocationControl');
                    temp.map.behaviors.disable('scrollZoom');

                    var points = self.setPoints(id);
                    temp.map.geoObjects.add(points);

                    if(points.getLength() > 1){
                        temp.map.setBounds(points.getBounds());
                        temp.map.setZoom(temp.map.getZoom());
                    }
                    else {
                        temp.map.setCenter(points.get(0).geometry.getCoordinates(), this.default.zoom);
                    }

                    var layer = temp.map.layers.get(0).get(0);

                    self.waitForTilesLoad(layer).then(function() {

                        var parent = el.parentElement;
                        var loading = parent.querySelector('.js-ymap-lazyload-loading');

                        if(loading != null){
                            loading.style.opacity = "0";
                            //element.style.filter  = 'alpha(opacity=90)'; // IE fallback

                            setTimeout(function(){
                                if(loading.parentElement != null){
                                    loading.parentElement.removeChild(loading);
                                }
                                
                            }, 500);
                        }

                        self.maps.push(temp);

                        self.initMap();

                    });

                }

                this.scroll();
            },
            loadApi: function(){
                if(this.apiStatus == 'ready'){
                    this.initMap();
                }
                else if(!this.apiStatus){
                    var js = document.createElement('script'),
                        self = this;

                    self.apiStatus = 'loading';

                    js.type = 'text/javascript';
                    js.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;loadByRequire=1';
                    js.onload = js.onreadystatechange = function(){
                        setTimeout(function(){
                            ymaps.load(self.initMap.bind(self));
                        }, 1000);
                        
                        self.apiStatus = 'ready';

                        self.interval = setInterval(function(){

                            if(typeof ymaps !== 'undefined' && typeof ymaps.Map == 'function'){
                                self.scroll();
                                clearInterval(self.interval);

                                if (window.addEventListener){
                                    window.addEventListener("scroll", self.instance, false);
                                }
                                else
                                if (window.attachEvent){
                                    window.attachEvent("scroll", self.instance);
                                }
                                else {
                                    window.onscroll = self.instance;
                                }
                                return;
                            }
                            else if(self.initInterations-- == 0){
                                clearInterval(self.interval);
                                return;
                            }

                        }, 200);
                        
                    }

                    document.body.appendChild(js);
                }
            },
            getTileContainer: function(layer){
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
            waitForTilesLoad: function(layer){
                var self = this;
                return new ymaps.vow.Promise(function (resolve, reject) {

                    var tc = self.getTileContainer(layer),
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
            findPosY: function(obj) {
                var curtop = 0;
                if (obj.offsetParent) {
                  while (1) {
                    curtop+=obj.offsetTop;
                    if (!obj.offsetParent) {
                        break;
                    }
                    obj=obj.offsetParent;
                  }
                } else if (obj.y) {
                  curtop+=obj.y;
                }
                return curtop;
            },
        };

        //ymapLoader.init();

        return ymapLoader;
}