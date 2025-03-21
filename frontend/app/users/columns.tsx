"use client";
import { ColumnDef } from "@tanstack/react-table";
import { SessionUser, User } from "@/lib/schemas";

import { UserActions } from "@/components/userActions";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    sessionUser?: SessionUser | null;
  }
}

export const columns: ColumnDef<User>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "username", header: "Username" },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      const user = row.original;
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    },
    filterFn: (row, columnId, filterValue) => {
      const fullName =
        `${row.original.first_name} ${row.original.last_name}`.toLowerCase();
      return fullName.includes(filterValue.toLowerCase());
    },
  },
  {
    id: "actions",
    cell: ({ table, row }) => {
      const user = row.original;
      const sessionUser = table.options.meta?.sessionUser;

      return <UserActions user={user} sessionUser={sessionUser} />;
    },
  },
];
