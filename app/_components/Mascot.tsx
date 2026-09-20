import Image from "next/image";

export function Mascot({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/assets/images/redledger-mascot.png"
      alt="RedLedger red panda mascot, holding a chart of resolved incidents trending up"
      width={size}
      height={size}
      className={className}
      priority={size > 60}
    />
  );
}
