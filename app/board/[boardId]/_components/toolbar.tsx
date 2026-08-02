export function Toolbar() {
  return (
    <div className="absolute top-[50%] left-2 flex translate-y-[-50%] flex-col gap-y-4">
      <div className="flex flex-col items-center gap-y-1 rounded-md bg-white p-1.5 shadow-md">
        <div>Pencil</div>
        <div>Square</div>
        <div>Circle</div>
        <div>Rectangle</div>
        <div>Ellipse</div>
      </div>
      <div className="flex flex-col items-center rounded-md bg-white p-1.5 shadow-md">
        <div>Undo</div>
        <div>Redo</div>
      </div>
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="absolute top-[50%] left-2 flex h-90 w-13 translate-y-[-50%] flex-col gap-y-4 rounded-md bg-white shadow-md" />
  );
}
