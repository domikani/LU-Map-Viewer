import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import {Image as ImageLayer, Tile as TileLayer, Group as LayerGroup, Vector as VectorLayer} from 'ol/layer';
import BingMaps from 'ol/source/BingMaps';
import {ZoomSlider} from 'ol/control';
import {defaults as defaultControls, FullScreen, ZoomToExtent, ScaleLine} from 'ol/control';
import Draw from 'ol/interaction/Draw';
import {Vector as VectorSource} from 'ol/source';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';




const extent = [1460205.410400966, 7494354.925647317, 1476383.18140756, 7510328.2183285635];

const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:3857',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;'
});


const osm = new TileLayer({
    source: new OSM()
});

const aerialBing = new TileLayer({
    source: new BingMaps({
        key: 'Aqp8I3JudojWmCJWenmf_fnPVQq4ImVy_pb2-kX--jvT4nfNmOFF1PXt150ICL27',
        imagerySet: 'AerialWithLabelsOnDemand'
    })
});

const source = new VectorSource({wrapX: false});

const vector = new VectorLayer({
    source: source
});

const group = new LayerGroup({
    layers: [
        new ImageLayer({
            source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/lund/wms',
                params: {'LAYERS': 'lund:roads'},
                ratio: 1,
                serverType: 'geoserver'


            })
        }),
        new ImageLayer({
            source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/lund/wms',
                params: {'LAYERS': 'lund:railroads'},
                ratio: 1,
                serverType: 'geoserver'


            })
        }),
        new ImageLayer({
            source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/lund/wms',
                params: {'LAYERS': 'lund:farm'},
                ratio: 1,
                serverType: 'geoserver'


            })
        }),
        new ImageLayer({
            source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/lund/wms',
                params: {'LAYERS': 'lund:public'},
                ratio: 1,
                serverType: 'geoserver'


            })
        }),
        new ImageLayer({
            source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/lund/wms',
                params: {'LAYERS': 'lund:other'},
                ratio: 1,
                serverType: 'geoserver'


            })
        }),
    ]
});



const map = new Map({
    controls: defaultControls({
        attributionOptions:/** @type {olx.control.AttributionOptions} */ ({
            collapsible: true
        })
    }).extend([
        mousePositionControl,


        new ZoomSlider,
        new FullScreen(),
        new ZoomToExtent({
            extent: extent
        })

    ]),
    layers: [osm, aerialBing, group, vector],
    target: 'map',
    view: new View({
        center: [1468005.3684, 7499744.6605],
        rotation: Math.PI/360,
        zoom: 11
    })
});




function bindInputs(layerid, layer) {
    const visibilityInput = $(layerid + ' input.visible');
    visibilityInput.on('change', function () {
        layer.setVisible(this.checked);
    });
    visibilityInput.prop('checked', layer.getVisible());

    const opacityInput = $(layerid + ' input.opacity');
    opacityInput.on('input change', function () {
        layer.setOpacity(parseFloat(this.value));
    });
    opacityInput.val(String(layer.getOpacity()));
}

map.getLayers().forEach(function (layer, i) {
    bindInputs('#layer' + i, layer);
    if (layer instanceof LayerGroup) {
        layer.getLayers().forEach(function (sublayer, j) {
            bindInputs('#layer' + i + j, sublayer);
        });
    }
});

$('#layertree li > span').click(function () {
    $(this).siblings('fieldset').toggle();
}).siblings('fieldset').hide();


const slider = document.getElementById('slider');

aerialBing.on('prerender', function (event) {
    const ctx = event.context;
    const width = ctx.canvas.width * (slider.value / 100);

    ctx.save();
    ctx.beginPath();
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
    ctx.clip();
});

aerialBing.on('postrender', function (event) {
    const ctx = event.context;
    ctx.restore();
});


slider.addEventListener('input', function () {
    map.render();
}, false);

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later
function addInteraction() {
    const value = typeSelect.value;
    if (value !== 'None') {
        draw = new Draw({
            source: source,
            type: typeSelect.value
        });
        map.addInteraction(draw);
    }
}
typeSelect.onchange = function () {
    map.removeInteraction(draw);
    addInteraction();
};

addInteraction();


