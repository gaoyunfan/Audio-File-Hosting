"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dispatch, SetStateAction, useState } from "react";
import {
  uploadAudio,
  getUploadUrl,
  getCategories,
} from "@/lib/actions/audio_actions";
import { toastError, toastSucccess } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { audioFormSchema, AudioFormValues, CategoryData } from "@/lib/schemas";
interface AudioUploadFormProps {
  onSubmit: (values: AudioFormValues) => Promise<void>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function AudioUploadForm({ onSubmit, setOpen }: AudioUploadFormProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const form = useForm<AudioFormValues>({
    resolver: zodResolver(audioFormSchema),
    defaultValues: {
      file: undefined,
      filename: "",
      description: "",
      category_id: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audio File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(e.target.files);
                    if (file) {
                      form.setValue("filename", file.name);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filename</FormLabel>
              <FormControl>
                <Input placeholder="e.g. my-audio.mp3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border border-input rounded px-3 py-2"
                >
                  <option value="">Select a category</option>
                  {categories.map((category: CategoryData) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:justify-between ">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !form.formState.isDirty ||
              !form.formState.isValid ||
              form.formState.isSubmitting
            }
          >
            Upload
          </Button>
        </div>
      </form>
    </Form>
  );
}
