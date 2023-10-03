import { useControl } from 'react-map-gl/maplibre';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import maplibregl from 'maplibre-gl';

import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

export default function GeocoderControl({ position }) {
  const nominatimApi = {
    forwardGeocode: async (config) => {
      const features = [];

      try {
        const { query } = config;
        const request = `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&polygon_geojson=1&addressdetails=1`;

        const response = await fetch(request);

        const geojson = await response.json();

        for (const feature of geojson.features) {
          const center = [
            feature.bbox[0] +
            (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] +
            (feature.bbox[3] - feature.bbox[1]) / 2,
          ];

          const point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: center
            },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ['place'],
            center,
          };

          features.push(point);
        }
      } catch (e) {
        console.error(`Failed to forwardGeocode with error: ${e}`);
      }

      return {
        features
      };
    }
  };

  useControl(
    () => {
      const options = {
        maplibregl,
        zoom: 12,
        enableEventLogging: false,
        showResultMarkers: false,
        marker: false,
      };
      return new MaplibreGeocoder(nominatimApi, options);
    },
    {
      position
    }
  );
}
