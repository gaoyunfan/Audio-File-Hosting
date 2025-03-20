"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { editUserSchema, EditUserFormData, User } from "@/lib/schemas";
import { toastSucccess, toastError } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface EditFormProps {
  user: User;
  onSubmit: (values: EditUserFormData) => Promise<void>;
  isPasswordChange?: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function EditUserForm({ user, onSubmit, setOpen }: EditFormProps) {
  const defaultValues = {
    ...user,
    old_password: "",
    password: "",
    password2: "",
  };
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });

  const hasChanges = (
    Object.keys(defaultValues) as Array<keyof EditUserFormData>
  ).some((key) => watchedValues[key] !== defaultValues[key]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter old password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  {...field}
                />
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
              !hasChanges ||
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
