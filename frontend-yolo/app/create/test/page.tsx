"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  stockName: z.string().min(2, {
    message: "Stock name must be at least 2 characters.",
  }),
  stockSymbol: z.string().min(1, {
    message: "Stock symbol must be at least 1 character.",
  }),
});

export default function TestPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockName: "",
      stockSymbol: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-black h-screen flex flex-col px-12 py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="stockName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Name</FormLabel>
                <FormControl>
                  <Input placeholder="alcohol stock" {...field} />
                </FormControl>
                <FormDescription>
                  This is the public display name of the stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockSymbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="CHS" {...field} />
                </FormControl>
                <FormDescription>
                  This is the ticker symbol of the stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}