export function ymapLazyload(){
	/*
	data-event="
		onReady
		onScroll
		onClick
	"
	data-points=""
	*/
	/*
	map: {
		id:
		points: [
			{
	
			}
		]
	}
	*/
	return {
		instance: {},
		status: false,
		selectorMap: '.js-ymap-lazyload',
		selectorLoading: '.js-ymap-lazyload-loading',
		api: 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;loadByRequire=1',
		maps: [],
		elements: [],
        points: [],
		default: {
			zoom: 15,
			coords: [55.865354, 37.585386]
		},
		init: function(params){
			if(typeof params != 'object' || !params.length){
				console.log('Invalid parametrs');
				return;
			}

			this.loadData(params);

			this.instance = this.scroll.bind(this);

			for(var prop in this.elements){
				
				if(this.elements[prop].event == 'onReady'){
					this.loadApi();
					break;
				}
				else if(this.elements[prop].event == 'onScroll'){
					if (window.addEventListener){
						window.addEventListener("scroll", this.instance, false);
					}
					else
					if (window.attachEvent){
						window.attachEvent("scroll", this.instance);
					}
				}
			}
			this.scroll();
		},
		loadData: function(params){
			var elements,
				mapIndex = 0,
				points = false,
				callback = false,
				id;

			for(var prop in params){
				elements = document.querySelectorAll(params[prop][0]);
				callback = params[prop][1] ? params[prop][1] : false;
				
				if(!elements.length) continue;

				for(var i = 0; i < elements.length; i++){
					id = 'ymapLazyload'+mapIndex;
					mapIndex++;

					elements[i].id = id;

					this.elements.push({
						id: id,
						ob: elements[i],
						event: elements[i].dataset.event ? elements[i].dataset.event : '',
						callback: callback,
						loaded: false
					});
				}
			}
		},
		scroll: function(){
            var winH = (window.innerHeight > 0) ? window.innerHeight : screen.height,
                scrollTop = document.documentElement.scrollTop || document.body && document.body.scrollTop || 0,
                posY,
                viewPosY2 = scrollTop + winH,
                viewPosY1 = scrollTop - winH;

			// если апи не загружено
			if(!this.status){

	            for(var prop in this.elements){
	                if(this.elements[prop].event == 'onScroll'){

	                    posY = this.findPosY(this.elements[prop].ob);

	                    if(viewPosY2 >= posY && viewPosY1 < posY){

	                        this.loadApi();
	                        if (window.removeEventListener){
	                            window.removeEventListener("scroll", this.instance, false);
	                        }else
	                        if (window.detachEvent){
	                            window.detachEvent("scroll", this.instance);
	                        }
	                        break;
	                    }
	                }
	            }

	        }
	        // если апи загружено
	        else {

                for(var prop in this.elements){
                    if(this.elements[prop].event == 'onScroll' && !this.elements[prop].loaded){
                    
                        posY = this.findPosY(this.elements[prop].ob);

                        if(viewPosY2 >= posY && viewPosY1 < posY){
                            this.elements[prop].loaded = true;
                            this.initMap(this.elements[prop].id);

                            break;
                        }
                    }
                }
	        }
		},
		initMap: function(selector){
            var id = '',
                self = this,
                index = false;

            selector = typeof selector == 'string' ? selector : '';

            for(var prop in this.elements){
                if(this.elements[prop].id == selector){
                    this.elements[prop].loaded = 1;
                    index = prop;
                    break;
                }
            }

            id = selector.replace(/#/, '');

            if(id == '') return;

            var el = document.getElementById(id);

            if(el && el.dataset && !el.dataset.loaded){
                el.dataset.loaded = 1;

                var temp = new ymaps.Map(id, {
                        center: self.default.coords,
                        zoom: self.default.zoom
                    });


                var layer = temp.layers.get(0).get(0);

                self.waitForTilesLoad(layer).then(function() {

                	// убираем элемент загрузки
                    var parent = el.parentElement;
                    var loading = parent.querySelector(self.selectorLoading);

                    if(loading != null){
                        loading.style.opacity = "0";
                        //element.style.filter  = 'alpha(opacity=90)'; // IE fallback

                        setTimeout(function(){
                            if(loading.parentElement != null){
                                loading.parentElement.removeChild(loading);
                            }
                            
                        }, 500);
                    }

                    self.elements[index].callback(temp);

                    self.initMap();

                });

            }

            this.scroll();

		},
        loadApi: function(){
           	var self = this;

            if(self.status == true){
                self.initMap();
            }
            else if(!self.status){
                var js = document.createElement('script');

                js.type = 'text/javascript';
                js.src = self.api;
                js.onload = js.onreadystatechange = function(){
                    setTimeout(function(){
                        ymaps.load(self.initMap.bind(self));
                    }, 1000);
                    
                    self.status = true;

                    // после загрузки апи, нужно дождаться инициализации переменных ymaps
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
		findPosY: function(obj) {
			var top = 0;
			if (obj.offsetParent) {
			  while (1) {
				top += obj.offsetTop;
				if (!obj.offsetParent) {
					break;
				}
				obj = obj.offsetParent;
			  }
			} else if (obj.y) {
			  top += obj.y;
			}
			return top;
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
        }
	}
}