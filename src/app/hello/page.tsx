"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send } from "lucide-react";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase/firebase";
// import Plot from 'react-plotly.js';
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ResponseItem {
  country: string;
  answer: string;
  embedding: number[];
}
const randomColor = (() => {
  "use strict";

  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return () => {
    const h = randomInt(0, 360);
    const s = randomInt(42, 98);
    const l = randomInt(40, 90);
    return `hsl(${h},${s}%,${l}%)`;
  };
})();

export default function Home() {
  const [data, setData] = useState<ResponseItem[]>([]);
  const [query, setQuery] = useState("");

  const submit = () => {
    if (query.trim()) {
      console.log("Searching for:", query);
      // Here you would typically handle the search action
      const addMessage = httpsCallable(functions, "embedding");
      addMessage({ text: query }).then((r) => {
        console.log(r);
        console.log(r.data);
        setData(r.data as ResponseItem[]);
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-4xl font-bold">G20特徴分析</h1>
      <div className="flex w-full max-w-sm items-center space-x-2 my-2">
        <Input
          type="search"
          placeholder="検索キーワードを入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" onClick={submit}>
          <Send></Send>
        </Button>
      </div>

      <Plot
        data={data.map((item) => {
          return {
            x: [item.embedding[0]],
            y: [item.embedding[1]],
            z: [item.embedding[2]],
            name: item.country,
            text: item.answer,
            type: "scatter3d",
            mode: "markers",
            marker: { color: randomColor() },
            hovertemplate: `<b>${item.country}</b><br><extra></extra>`,
          };
        })}
        layout={{ margin: { l: 0, r: 0, b: 0, t: 0 } }}
      />
      <div className="container mx-auto py-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">国名</TableHead>
              <TableHead>説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.country}</TableCell>
                <TableCell>{item.answer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
