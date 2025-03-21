"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/registerFrom";
import { toastSucccess, toastError } from "@/lib/utils";
import { RegisterFormData } from "@/lib/schemas";
import { createUser } from "@/lib/actions/user_actions";
import { useQueryClient } from "@tanstack/react-query";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (values: RegisterFormData) => {
    const res = await createUser(values);
    if (res.success) {
      toastSucccess("User created successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    } else {
      toastError(res.message || "An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
        </DialogHeader>
        <RegisterForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
