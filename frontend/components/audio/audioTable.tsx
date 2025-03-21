"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/actions/user_actions";
import { useUserSession } from "@/lib/hooks";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/components/createUserDialog";
import { Filter } from "@/components/filter";
import { getAudios } from "@/lib/actions/audio_actions";
import { UploadAudioDialog } from "./uploadAudioDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
}

export function AudioDataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const { data = [] } = useQuery({
    queryKey: ["audios"],
    queryFn: getAudios,
    refetchInterval: 1000 * 60 * 5,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { user } = useUserSession();

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    meta: { sessionUser: user },
  });

  return (
    <div className="p-5 flex flex-col space-y-4  h-[calc(100vh-5rem)]">
      <div className="flex justify-end">
        <UploadAudioDialog />
      </div>
      <Table className="w-full border border-gray-300 border-collapse overflow-y-auto">
        <TableHeader className="bg-gray-200 border-b border-gray-300 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-gray-300">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="border border-gray-300 px-4 py-2 text-gray-800 font-semibold"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div className="pb-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} />
                          </div>
                        ) : null}
                      </>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-gray-300 hover:bg-gray-100 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-b border-gray-300">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
