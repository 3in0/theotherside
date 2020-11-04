

var _e = (function () {

	var _e = {

		mapPackages: {},

		initialise: function () {

			console.log( "initialise" );

			let aLonLat = [ 151, -33 ];

			var aLeftCoord = window.ol.proj.transform( aLonLat, 'EPSG:4326', 'EPSG:3857' );

			console.log( aLeftCoord );

			this.createMap('map-left', aLeftCoord, 4, 'stickman-blue.png');
			this.createMap('map-right', [16829524.943931032, -4002747.2499114294], 4, 'stickman-orange.png');

			this.mapPackages[ 'map-left' ].map.on("click", this.mapClicked.bind(this));

			this.moveRight( aLonLat );

		},

		mapClicked: function( anEvent ) {

			var aPixel = anEvent.pixel;
			var aCoord = this.mapPackages[ 'map-left' ].map.getCoordinateFromPixel(aPixel);

			var aLonLat = window.ol.proj.transform( aCoord, 'EPSG:3857', 'EPSG:4326');

			console.log( aLonLat );
			console.log( aCoord );

			this.mapPackages[ 'map-left' ].map.getView().setCenter( aCoord );
			this.moveRight( aLonLat );


		},

		currentLongLat: function() {

			let aCoord = this.mapPackages[ 'map-left' ].map.getView().getCenter();

			return window.ol.proj.transform( aCoord, 'EPSG:3857', 'EPSG:4326' );

		},

		moveRight: function() {

			let aLongLat = this.currentLongLat();

			this.mapPackages[ 'map-left' ].feature.getGeometry().setCoordinates(  this.mapPackages[ 'map-left' ].map.getView().getCenter() );

			let aLong = aLongLat[ 0 ] + 180;
			let aLat = -1 * aLongLat[ 1 ];

			var aCoord = window.ol.proj.transform( [ aLong, aLat ], 'EPSG:4326', 'EPSG:3857' );

			this.mapPackages[ 'map-right' ].map.getView().setCenter( aCoord );

			this.mapPackages[ 'map-right' ].feature.getGeometry().setCoordinates( aCoord );
			this.mapPackages[ 'map-right' ].map.getView().setZoom( this.mapPackages[ 'map-left' ].map.getView().getZoom() );

		},

		getLocation: function() {
		
			if (navigator.geolocation) {
			  navigator.geolocation.getCurrentPosition(this.useLocation.bind( this ) );
			} 
		
		},
		  
		useLocation: function(position) {
			
			var aLonLat = [ position.coords.longitude, position.coords.latitude ];

			var aCoord = window.ol.proj.transform( aLonLat, 'EPSG:4326', 'EPSG:3857' );

			console.log( aLonLat );
			console.log( aCoord );

			this.mapPackages[ 'map-left' ].map.getView().setCenter( aCoord );
			this.moveRight( aLonLat );

		},

		createMap: function (aName, aCenter, aZoom, aVector) {

			console.log( "creating map ", aName );

			// STAMEN

			let aStamenLayer = new ol.layer.Tile({
				source: new ol.source.Stamen({
					layer: 'toner'
					//layer: 'terrain'
				})
			});

			aStamenLayer.set('name', 'stamen');

			var someLayers = [];

			someLayers.push(aStamenLayer);

			if (aVector) {

				var aStyle = new ol.style.Style({

					image: new ol.style.Icon({
						//src: 'images/treatment-20w.png'
						src: aVector,
						scale: 0.2
					})

				});

				var aLayer = new ol.layer.Vector({
					source: new ol.source.Vector({
						crossOrigin: 'anonymous',
						projection: 'EPSG:4326',
						format: new ol.format.GeoJSON()
					}),

					style: aStyle

				});

				someLayers.push(aLayer);


					
				var aFeatureJson = {
					"type": "Feature",
					"id": "1",
					"properties": {
						"type": "orientate"
					},
					"geometry": {
						"type": "Point",
						"coordinates": [0, 0]
					}
				};

				var aFormat = new window.ol.format.GeoJSON();

				var aFeature = aFormat.readFeature(aFeatureJson, {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				});


				aLayer.getSource().addFeature(aFeature);

			}

			// Map..

			var aMap = new ol.Map({

				controls: [],
				layers: someLayers,

				target: aName,

				view: new ol.View({

					center: aCenter,

					zoom: aZoom,
					minZoom: 1,
					maxZoom: 22

				}),

				moveTolerance: 10

			});

			var aPackage = {};

			aPackage['map'] = aMap;
			aPackage['layers'] = someLayers;
			aPackage[ 'feature' ] = aFeature;

			this.mapPackages[aName] = aPackage;

		},

		launchHook: function () {

			document.getElementById("depip-locate").onclick = this.getLocation.bind( this );

			this.launchHookCallback( {} );

		},

		launchHookCallback: function (someData) {

			this.initialise();

			//$(window).resize( this.initialise.bind( this ) );

		}

	}

	return _e;

}());

$(document).ready(

	function () {

		this.launchHook();

	}.bind(_e)

);

