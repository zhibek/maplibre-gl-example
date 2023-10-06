import { useRef, useState, useMemo, useEffect } from 'react';
import MapElement, { Layer, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

import GeocoderControl from './GeocoderControl';

import 'maplibre-gl/dist/maplibre-gl.css';

import countryboundariesVectorMapstyle from './countryboundaries_vector_mapstyle.json';
// import naturalearthVectorMapstyle from './naturalearth_vector_mapstyle.json';
// import stamenWatercolorMapstyle from './stamen_watercolor_mapstyle.json';

const cloneLayerById = (mapJson, id, newId) => {
  const layers = mapJson.layers.filter((layer) => ( layer.id === 'country-area'));

  if (!layers?.length) {
    return null;
  }

  const newLayer = structuredClone(layers[0]);

  newLayer.id = newId;

  return newLayer;
}

const MapView = () => {
  const mapRef = useRef();
  const [activeFeatures, setActiveFeatures] = useState([]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const layerTemplate = cloneLayerById(countryboundariesVectorMapstyle, 'countries-area', `countries-area-highlight-template`);
  layerTemplate.paint['fill-opacity'] = 0; // TODO
  layerTemplate.paint['fill-opacity-transition'] = { duration: 1000 };

  const buildHighlightLayer = (feature) => {
    const id = feature?.id;
    const code = feature?.properties?.ADM0_A3;

    const layer = structuredClone(layerTemplate);
    layer.id = `countries-area-highlight-${id}`;
    layer.key = `countries-area-highlight-${id}`;
    layer.filter = ['in', 'ADM0_A3', code];

    return layer;
  };

  const onFeatureActive = (e) => {
    const features = e.features || [];

    if (features.length > 0) {
      setActiveFeatures(current => {
        const list = [...current, features[0]];
        const map = new Map(list.map(item => [item.id, item]));
        const uniques = [...map.values()];

        current.forEach((oldFeature) => {
          if (oldFeature?.id === features[0]?.id) {
            return;
          }

          mapRef.current.getMap().setPaintProperty(`countries-area-highlight-${oldFeature.id}`, 'fill-opacity', 0);
        });

        setTimeout(() => {
          mapRef.current.getMap().setPaintProperty(`countries-area-highlight-${features[0].id}`, 'fill-opacity', 0.8);
        }, 50);

        return uniques;
      });
    } else {
      setActiveFeatures(current => {
        current.forEach((oldFeature) => {
          mapRef.current.getMap().setPaintProperty(`countries-area-highlight-${oldFeature.id}`, 'fill-opacity', 0);
        });

        return [...current];
      });
    }
  };

  return (
    <MapElement
      ref={mapRef}
      initialViewState={{
        longitude: 0,
        latitude: 51.5,
        zoom: 6,
      }}
      style={{width: '100%', height: '100%'}}
      mapLib={maplibregl}
      mapStyle={countryboundariesVectorMapstyle}
      hash={true}
      interactiveLayerIds={["country-area"]}
      onClick={onFeatureActive}
      onMouseMove={onFeatureActive}
    >
      <GeocoderControl />
      <NavigationControl position="top-left" showCompass={false} />
      {activeFeatures.map(feature => (
        <Layer
          beforeId="country-area"
          { ...buildHighlightLayer(feature) }
        />
      ))}
    </MapElement>
  );
};

export default MapView;
