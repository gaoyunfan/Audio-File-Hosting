"use client";

import { useState } from "react";
import {
  EditUserFormData,
  SESSION_TERMINATED_MESSAGE,
  SessionUser,
  User,
} from "@/lib/schemas";
import { MoreHorizontal, Trash, Pencil, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { deleteUser, updateUser } from "@/lib/actions/user_actions";
import { callValidatePath } from "@/lib/actions/auth";
import { useQueryClient } from "@tanstack/react-query";
import { EditUserForm } from "./editUserForm";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  user: User;
  sessionUser?: SessionUser | null;
}

export function UserActions({ user, sessionUser }: UserActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "delete" | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_admin = sessionUser?.isAdmin ?? false;
  const is_editable = is_admin || sessionUser?.id === user?.id;
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toastSucccess("User deleted successfully");
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        setDialogOpen(false);
      } else {
        toastError(res.message || "Failed to delete user");
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

  const handleEditUser = async (values: EditUserFormData) => {
    const filteredValues = { ...values };

    if (!filteredValues.old_password) delete filteredValues.old_password;
    if (!filteredValues.password) delete filteredValues.password;
    if (!filteredValues.password2) delete filteredValues.password2;
    try {
      const res = await updateUser(user.id, filteredValues);
      if (res.success) {
        toastSucccess("User updated successfully");
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        setDialogOpen(false);
      } else {
        toastError(res.message || "Failed to update user");
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
            <DropdownMenuLabel>User: {user.username}</DropdownMenuLabel>
            {is_editable && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    setDialogType("edit");
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setDialogType("delete");
                    setDialogOpen(true);
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="min-w-[300px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "edit"
                ? `Edit User: ${user.username}`
                : `Delete User: ${user.username}`}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "edit"
                ? "Update the user details below."
                : "Are you sure? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "edit" ? (
            <EditUserForm
              user={user}
              setOpen={setDialogOpen}
              onSubmit={handleEditUser}
            />
          ) : (
            <>
              <div className="font-semibold">
                This will permanently delete the user: {user.username};.
              </div>
              <DialogFooter className="md:justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleDelete(user.id)}>
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
