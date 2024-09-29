"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "./lib/firebase/firebase";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import Index from ".";
import Loading from "./loading";
import DataItem from "./data";
import Result from "./result";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast()

  const submit = async (query: string) => {
    console.log("Searching for:", query.trim());
    setLoading(true);
    const addMessage = httpsCallable(functions, "embedding");
    try {
      const result = await addMessage({ text: query });
      setData(result.data as DataItem[]);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "もう一度試してみてください。",
      })
    } finally {
      setQuery(query);
      setLoading(false);
    }
  };

  const contents = data.length > 0
    ? <Result query={query} data={data} onSubmit={submit} />
    : <Index onSubmit={submit} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      {loading ? <Loading /> : contents}
      <Toaster />
    </div>
  );
}
