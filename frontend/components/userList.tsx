"use client";
import { getUsers } from "@/lib/actions/user_actions";
import { User } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";

export default function UserList() {
  const { data = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });
  console.log("data", data);
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.map((user: User) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
