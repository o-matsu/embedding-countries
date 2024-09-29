import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import DataItem from "./data";

type Props = {
  active: DataItem | null;
  data: DataItem[];
}

const ScatterPlot = ({ active, data }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = data.map((item) => {
      return {
        x: item.embedding[0],
        y: item.embedding[1],
        country: item.country,
        answer: item.answer,
      };
    });
    const plot = Plot.plot({
      inset: 20,
      nice: true,
      grid: true,
      color: {
        type: "diverging",
        scheme: "BuRd"
      },
      marks: [
        Plot.frame(),
        active?.embedding && Plot.dot(items, {
          x: active.embedding[0],
          y: active.embedding[1],
          fill: "red",
          r: 8
        }),
        Plot.dot(items, {
          x: "x",
          y: "y",
          stroke: "x",
        }),
        Plot.text(items, { x: "x", y: "y", text: "country", textAnchor: "start", dx: 6 }),
        active == null ?
          Plot.tip(items, Plot.pointer({
            x: "x",
            y: "y",
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