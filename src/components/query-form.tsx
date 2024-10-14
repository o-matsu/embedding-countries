"use client"

import { CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type Props = {
  query: string;
  onSubmit: (query: string) => void;
}

const formSchema = z.object({
  query: z.string().min(1).max(30),
})

export default function QueryForm({ query = "", onSubmit }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: query,
    },
  })
  function submit(values: z.infer<typeof formSchema>) {
    onSubmit(values.query)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="relative space-y-0">
              <FormControl>
                <Input className="w-full bg-gray-800 border-gray-700 text-white pl-4 pr-10 py-2 rounded-md"
                  placeholder="比較する特徴を入力"
                  {...field} />
              </FormControl>
              <Button type="submit" className="absolute right-0 top-0 bg-transparent">
                <CornerDownLeft className="text-gray-400" />
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}