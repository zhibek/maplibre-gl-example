import { useRef, useState, useMemo, useEffect } from 'react';
import Map, { Layer, NavigationControl } from 'react-map-gl/maplibre';
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
  const [activeFeature, setActiveFeature] = useState();

  const filter = useMemo(
    () => {
      if (!activeFeature?.id) {
        return ['in', 'ADM0_A3', ''];
      }
      return ['in', 'ADM0_A3', activeFeature?.properties?.ADM0_A3];
    },
    [activeFeature]
  );

  const highlightLayer = cloneLayerById(countryboundariesVectorMapstyle, 'countries-area', 'countries-area-highlight');
  if (highlightLayer) {
    highlightLayer.paint['fill-opacity-transition'] = { duration: 500 };
    highlightLayer.paint['fill-opacity'] = 0;
  }

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const onFeatureActive = (e) => {
    const features = e.features || [];

    if (features.length > 0) {
      setActiveFeature(features[0]);

      mapRef.current.getMap().setPaintProperty('countries-area-highlight', 'fill-opacity', 0.8);
    } else {
      setActiveFeature(null);

      mapRef.current.getMap().setPaintProperty('countries-area-highlight', 'fill-opacity', 0);
    }
  };

  return (
    <Map
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
      {!!highlightLayer?.id && (
        <Layer
          filter={filter}
          beforeId="country-area"
          { ...highlightLayer }
        />
      )}
    </Map>
  );
};

export default MapView;
