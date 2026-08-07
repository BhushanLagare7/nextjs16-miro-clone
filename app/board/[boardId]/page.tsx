import type { Metadata } from "next";

import { Room } from "@/components/room";
import { SITE_CONFIG } from "@/lib/constants/site";

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
    title: `${SITE_CONFIG.boardMetadata.titlePrefix} ${boardId}`,
    description: SITE_CONFIG.boardMetadata.description,
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

