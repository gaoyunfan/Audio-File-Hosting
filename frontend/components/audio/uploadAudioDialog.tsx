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
import { callValidatePath } from "@/lib/actions/auth";
import { toastSucccess, toastError } from "@/lib/utils";
import {
  AudioFormValues,
  RegisterFormData,
  SESSION_TERMINATED_MESSAGE,
} from "@/lib/schemas";
import { createUser } from "@/lib/actions/user_actions";
import { useQueryClient } from "@tanstack/react-query";
import { AudioUploadForm } from "./uploadAudioForm";
import {
  deleteAudio,
  getUploadUrl,
  uploadAudio,
} from "@/lib/actions/audio_actions";
import { useRouter } from "next/navigation";

export function UploadAudioDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const onSubmit = async (values: AudioFormValues) => {
    try {
      const file = values.file[0];

      const res = await getUploadUrl({
        filename: file.name,
        description: values.description,
        category_id: values.category_id,
      });

      if (!res.success) {
        toastError("Failed to upload audio");
        return;
      }
      const { id, upload_url } = res.data;
      console.log(`upload_url: ${upload_url}`);
      const uploadRes = await uploadAudio(file, upload_url);
      if (!uploadRes.success) {
        toastError("Upload failed");
        await deleteAudio(id);
      } else {
        toastSucccess("Audio uploaded successfully");
        queryClient.invalidateQueries({ queryKey: ["audios"] });
        setOpen(false);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === SESSION_TERMINATED_MESSAGE
      ) {
        toastError("Session expired. Please log in again.");
        router.push("/users/login");
      } else {
        toastError("An unexpected error");
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Audio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload audio</DialogTitle>
        </DialogHeader>
        <AudioUploadForm onSubmit={onSubmit} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
