import Image from "next/image";

export function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center">
      <Image
        alt="Logo"
        className="animate-pulse duration-700"
        height={120}
        src="/logo.svg"
        width={120}
      />
    </div>
  );
}
