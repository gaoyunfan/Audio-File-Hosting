"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Audio } from "@/lib/schemas";
import { AudioActions } from "./audioActions";

export const audioColumns: ColumnDef<Audio>[] = [
  {
    accessorKey: "file_name",
    header: "Filename",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.getValue("description"),
  },
  {
    accessorKey: "category_data",
    header: "Category",
    cell: ({ row }) => row.original.category_data?.name || "Uncategorized",
  },
  {
    accessorKey: "upload_date",
    header: "Uploaded",
    cell: ({ row }) => row.getValue("upload_date"),
  },
  {
    id: "audio_player",
    header: "Play",
    cell: ({ row }) => (
      <audio controls preload="none" className="w-48">
        <source src={row.original.file_url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    ),
  },
  {
    id: "actions",
    cell: ({ table, row }) => {
      const audio = row.original;
      const sessionUser = table.options.meta?.sessionUser;

      return <AudioActions audio={audio} sessionUser={sessionUser} />;
    },
  },
];
