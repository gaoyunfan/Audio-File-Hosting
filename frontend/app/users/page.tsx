import { getUsers } from "@/lib/actions/user_actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { DataTable } from "./datatable";
import { columns } from "./columns";

export default async function UsersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <div className="h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DataTable columns={columns} />
      </HydrationBoundary>
    </div>
  );
}
