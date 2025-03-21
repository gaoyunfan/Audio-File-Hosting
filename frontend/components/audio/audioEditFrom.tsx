"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  audioEditFormSchema,
  AudioEditFormValues,
  CategoryData,
} from "@/lib/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/actions/audio_actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Audio } from "@/lib/schemas";

interface AudioEditFormProps {
  audio: Audio;
  onSubmit: (values: AudioEditFormValues) => Promise<void>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function AudioEditForm({
  audio,
  onSubmit,
  setOpen,
}: AudioEditFormProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const defaultValues: AudioEditFormValues = {
    filename: audio.file_name,
    description: audio.description,
    category_id: String(audio.category_data.id),
  };
  const form = useForm<AudioEditFormValues>({
    resolver: zodResolver(audioEditFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [audio]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md"
      >
        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filename</FormLabel>
              <FormControl>
                <Input {...field} />
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
                    <option key={category.id} value={String(category.id)}>
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
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
