"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  LightingEffect,
  _GlobeView as GlobeView,
  AmbientLight,
} from '@deck.gl/core';
import { SimpleMeshLayer } from 'deck.gl';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { SphereGeometry } from '@luma.gl/engine';
import type { GlobeViewState, PickingInfo, Position, Color } from '@deck.gl/core';
import { mapCountry } from '@/app/map-country';
import DataItem from '@/app/data';
import { clusterColors } from '@/app/cluster-colors';
import _ from 'lodash';
import { centerCountry } from '@/app/center-country';

const EARTH_RADIUS_METERS = 6.3e6;
const countryJson = './countries.geojson';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});
const lightingEffect = new LightingEffect({ ambientLight });


type Props = {
  active: DataItem | null;
  data: DataItem[] | null;
}
type Similarity = {
  to: string;
  coordinates: [number, number];
  value: number;
}

const Globe = ({ active, data }: Props) => {
  const [viewState, setViewState] = useState<GlobeViewState>({
    longitude: 138.2529,
    latitude: 36.2048,
    zoom: 0,
    maxZoom: 0,
  });
  const [similarities, setSimilarities] = useState<Map<string, Similarity[]>>(new Map());

  useEffect(() => {
    if (data == null) return;
    setSimilarities(new Map(
      data.map(
        (d, i) => [data[i].country, d.similarity.map(
          (s, j) => { return { to: data[j].country, coordinates: centerCountry[data[j].country], value: s } as Similarity }
        )
        ]
      )
    ));
  }, [data]);

  const getFillColor = useCallback((country: string): number[] => {
    if (country in mapCountry) {
      if (data == null) {
        return [255, 200, 0];
      } else {
        const item = data.find(d => mapCountry[country as keyof typeof mapCountry].includes(d.country));
        return item ? convertColorCode(item.cluster) : [0, 0, 0, 0];
      }
    }
    return [0, 0, 0, 0];
  }, [data]);

  const backgroundLayers = useMemo(() => [
    new SimpleMeshLayer({
      id: 'earth-sphere',
      data: [0],
      mesh: new SphereGeometry({ radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36 }),
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: [0, 0, 0],
      getColor: [180, 180, 255]
    }),
    new GeoJsonLayer({
      id: 'earth-land',
      data: countryJson,
      opacity: 1,
      getLineColor: [120, 120, 120],
      getFillColor: [80, 80, 80],
      getLineWidth: 10000,
    }),
  ], []);

  const clusterLayer = useMemo(() =>
    new GeoJsonLayer({
      id: 'cluster',
      data: countryJson,
      pickable: true,
      stroked: false,
      opacity: 0.8,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 124],
      getFillColor: f => new Uint8Array(getFillColor(f.properties.ADMIN)),
    }),
    [getFillColor]);

  const activeLayer = useMemo(() => {
    if (active == null) {
      return null;
    }
    setViewState(viewState => ({
      ...viewState,
      longitude: centerCountry[active.country][0],
      latitude: centerCountry[active.country][1],
      transitionDuration: 1000,
      onTransitionEnd: () => null,
    }));

    return new GeoJsonLayer({
      id: 'active: ' + active.country,
      data: countryJson,
      stroked: false,
      opacity: 0.5,
      getFillColor: (f) => {
        if (!mapCountry[f.properties.ADMIN as keyof typeof mapCountry]?.includes(active?.country)) {
          return [0, 0, 0, 0];
        }
        return [255, 255, 255, 124];
      },
    });
  },
    [active]);

  const arcLayer = useMemo(() => {
    if (active == null) {
      return null;
    }
    return new ArcLayer({
      id: 'arc',
      data: similarities.get(active.country) || [],
      opacity: 0.3,
      getSourcePosition: () => centerCountry[active.country] as Position,
      getTargetPosition: s => s.coordinates,
      getSourceColor: () => convertColorCode(active.cluster) as Color,
      getTargetColor: s => convertColorCode(data!.find(d => d.country === s.to)!.cluster) as Color,
      getWidth: s => s.value * 7,
      getTilt: 90,
    });
  },
    [similarities, active, data]);

  const rotateCamera = useCallback(() => {
    setViewState(viewState => ({
      ...viewState,
      longitude: viewState.longitude + 30,
      transitionDuration: 5000,
      onTransitionEnd: rotateCamera
    }));
  }, []);
  const tripTo = useCallback((info: PickingInfo) => {
    if (info.picked) {
      const center = calculateCenter(info.object.geometry.coordinates);
      if (center == null) return;
      setViewState(viewState => ({
        ...viewState,
        longitude: center![0],
        latitude: center![1],
        transitionDuration: 1000,
        onTransitionEnd: () => null,
      }));
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: 400,
        height: 400
      }}
    >
      <DeckGL
        views={new GlobeView()}
        initialViewState={viewState}
        controller={true}
        effects={[lightingEffect]}
        layers={[...backgroundLayers, clusterLayer, activeLayer, arcLayer]}
        onLoad={rotateCamera}
        onClick={tripTo}
      />
    </div>
  );
}

export default Globe;

function convertColorCode(cluster: number) {
  const code = clusterColors[cluster];
  const codePairs = code.slice(1).match(/../g);
  return codePairs!.map(pair => parseInt(pair, 16));
}


function calculateCenter(points: [number, number][][][]): [number, number] | null {
  if (points.length === 0) return null;

  const centerX = _.meanBy(points, (point: [number, number][][]) => _.meanBy(point[0], (p: [number, number]) => p[0]));
  const centerY = _.meanBy(points, (point: [number, number][][]) => _.meanBy(point[0], (p: [number, number]) => p[1]));

  return [centerX, centerY];
}
