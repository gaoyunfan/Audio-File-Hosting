import { getUsers } from "@/lib/actions/users";
import { User } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";

export default function Users() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
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
