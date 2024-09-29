"use client"

import { Earth } from "lucide-react";
import QueryForm from "./query-form";

type Props = {
  onSubmit: (query: string) => void;
}

export default function Index({ onSubmit }: Props) {
  return (
    <>
      <Earth className="inline-block m-8" size={84} />
      <h1 className="text-2xl mb-8 text-center">
        G20の特徴を比べてみましょう。
      </h1>
      <div className="w-full max-w-md">
        <QueryForm query="" onSubmit={onSubmit} />
      </div>
      <div className="m-12">
        <p className="text-gray-400 text-sm">G20とは、G7（フランス、米国、英国、ドイツ、日本、イタリア、カナダ（G7の議長国順）及び欧州連合（EU）に加え、アルゼンチン、豪州、ブラジル、中国、インド、インドネシア、メキシコ、韓国、ロシア、サウジアラビア、南アフリカ、トルコ（アルファベット順）及びアフリカ連合（AU）が参加する枠組です。G20の会議には、G20メンバー以外の招待国や国際機関などが参加することもあります。</p>
      </div>
    </>
  );
}