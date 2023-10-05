import { useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

import GeocoderControl from './GeocoderControl';

import 'maplibre-gl/dist/maplibre-gl.css';

import naturalearthVectorMapstyle from './naturalearth_vector_mapstyle.json';
import stamenWatercolorMapstyle from './stamen_watercolor_mapstyle.json';

const MapView = () => {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: 0,
        latitude: 51.5,
        zoom: 6,
      }}
      style={{width: '100%', height: '100%'}}
      mapLib={maplibregl}
      mapStyle={stamenWatercolorMapstyle}
      hash={true}
    >
      <GeocoderControl />
      <NavigationControl position="top-left" showCompass={false} />
    </Map>
  );
};

export default MapView;
