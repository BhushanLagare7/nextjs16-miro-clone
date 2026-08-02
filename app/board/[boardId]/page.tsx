import { Room } from "@/components/room";

import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/loading";

interface BoardIdPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardIdPage({ params }: BoardIdPageProps) {
  const { boardId } = await params;
  return (
    <Room fallback={<Loading />} roomId={boardId}>
      <Canvas boardId={boardId} />
    </Room>
  );
}
