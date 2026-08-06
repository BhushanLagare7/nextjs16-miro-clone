import type { Metadata } from "next";

import { Room } from "@/components/room";

import { Canvas } from "./_components/canvas";
import { BoardIdPageSkeleton } from "./_components/loading";

interface BoardBoardIdPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({
  params,
}: BoardBoardIdPageProps): Promise<Metadata> {
  const { boardId } = await params;

  return {
    title: `Board ${boardId}`,
    description: `Collaborative canvas board on NexCanvas`,
    alternates: {
      canonical: `/board/${boardId}`,
    },
  };
}

export default async function BoardBoardIdPage({
  params,
}: BoardBoardIdPageProps) {
  const { boardId } = await params;
  return (
    <Room fallback={<BoardIdPageSkeleton />} roomId={boardId}>
      <Canvas boardId={boardId} />
    </Room>
  );
}

