"use client";

import { useState } from "react";
import {
  Audio,
  AudioEditFormValues,
  SESSION_TERMINATED_MESSAGE,
  SessionUser,
} from "@/lib/schemas";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastSucccess, toastError } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteAudio, updateAudio } from "@/lib/actions/audio_actions";
import { AudioEditForm } from "./audioEditFrom";

interface UserActionsProps {
  audio: Audio;
  sessionUser?: SessionUser | null;
}

export function AudioActions({ audio }: UserActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "delete" | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAudio(id);
      if (res.success) {
        toastSucccess("Audio deleted successfully");
        await queryClient.invalidateQueries({ queryKey: ["audios"] });
        setDialogOpen(false);
      } else {
        toastError(res.message || "Failed to delete audio");
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

  const handleUpdateAudio = async (values: AudioEditFormValues) => {
    try {
      const res = await updateAudio(audio.id, values);
      if (res.success) {
        toastSucccess("Audio updated successfully");
        await queryClient.invalidateQueries({ queryKey: ["audios"] });
        setDialogOpen(false);
      } else {
        toastError(res.message || "Failed to update audio");
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
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-2">
            <DropdownMenuLabel>Audio: {audio.file_name}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setDialogType("edit");
                setDialogOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Audio
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDialogType("delete");
                setDialogOpen(true);
              }}
            >
              <Trash className="w-4 h-4 mr-2" /> Delete Audio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="min-w-[300px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "edit"
                ? `Edit User: ${audio.file_name}`
                : `Delete User: ${audio.file_name}`}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "edit"
                ? "Update the audio details below."
                : "Are you sure? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "edit" ? (
            <AudioEditForm
              audio={audio}
              setOpen={setDialogOpen}
              onSubmit={handleUpdateAudio}
            />
          ) : (
            <>
              <div className="font-semibold">
                This will permanently delete the audio: {audio.file_name}
              </div>
              <DialogFooter className="md:justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleDelete(audio.id)}>
                  Confirm Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
