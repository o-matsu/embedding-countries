"use client"

import QueryForm from "../components/query-form";
import DataItem from "./data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ScatterPlot from "../components/scatter-plot";
import { useState } from "react";
import Globe from "@/components/globe";

type Props = {
  query: string;
  data: DataItem[];
  onSubmit: (query: string) => void;
}

export default function Result({ query, data, onSubmit }: Props) {
  const [hoverItem, setHoverItem] = useState<DataItem | null>(null);
  return (
    <>
      <div className="w-full max-w-md">
        <QueryForm query={query} onSubmit={onSubmit} />
      </div>

      <div className="md:flex">
        <ScatterPlot active={hoverItem} data={data} />
        <Globe active={hoverItem} data={data} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">国名</TableHead>
            <TableHead>説明</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} onMouseEnter={() => setHoverItem(item)} onMouseLeave={() => setHoverItem(null)}>
              <TableCell className="font-medium">{item.country}</TableCell>
              <TableCell>{item.answer}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}