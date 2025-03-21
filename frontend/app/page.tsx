// app/posts/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { AudioDataTable } from "@/components/audio/audioTable";

import { getAudios } from "@/lib/actions/audio_actions";
import { audioColumns } from "@/components/audio/audioColumns";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["audios"],
    queryFn: getAudios,
  });
  return (
    <div className="h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AudioDataTable columns={audioColumns} />
      </HydrationBoundary>
    </div>
  );
}
