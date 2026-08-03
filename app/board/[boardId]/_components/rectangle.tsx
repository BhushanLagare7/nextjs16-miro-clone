import { RectangleLayer } from "@/types/canvas";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export function Rectangle({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      className="drop-shadow-md"
      fill="#000"
      height={height}
      stroke="transparent"
      strokeWidth={1}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      width={width}
      x={0}
      y={0}
      onPointerDown={(e) => onPointerDown(e, id)}
    />
  );
}
