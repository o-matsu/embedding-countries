import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import DataItem from "../app/data";
import { clusterColors } from "@/app/cluster-colors";

type Props = {
  active: DataItem | null;
  data: DataItem[];
}

const ScatterPlot = ({ active, data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plot = Plot.plot({
      inset: 20,
      nice: true,
      grid: true,
      // color: {
      //   scheme: "RdYlGn",
      //   domain: [0, 1, 2], // in age order
      // },
      marks: [
        Plot.frame(),
        Plot.hull(data, {
          x: "embedding-x",
          y: "embedding-y",
          fill: (d) => clusterColors[d.cluster],
          // fill: "cluster",
          fillOpacity: 0.2,
        }),
        active && Plot.dot([active], {
          x: "embedding-x",
          y: "embedding-y",
          fill: "white",
          r: 6,
        }),
        Plot.dot(data, {
          x: "embedding-x",
          y: "embedding-y",
          fill: (d) => clusterColors[d.cluster],
        }),
        Plot.text(data, { x: "embedding-x", y: "embedding-y", text: "country", textAnchor: "start", dx: 6 }),
        active == null ?
          Plot.tip(data, Plot.pointer({
            x: "embedding-x",
            y: "embedding-y",
            title: (d) => d.answer,
            fill: "black",
          })) : null,
      ]
    });
    if (containerRef.current) {
      containerRef.current.append(plot);
    }
    return () => plot.remove();
  }, [active, data]);
  return <div ref={containerRef} />;
}
export default ScatterPlot;