import Image from "next/image"
import { cn } from "@/lib/utils"

export type ResourceType = "spice" | "solari" | "water" | "troops" | "victorypoint"

interface ResourceIconProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  type: ResourceType
  size?: "sm" | "md" | "lg" | "xl"
  label?: string | number
  inline?: boolean
}

const RESOURCE_MAP: Record<ResourceType, string> = {
  spice: "/images/spice_blank.png",
  solari: "/images/solari_blank.png",
  water: "/images/water.png",
  troops: "/images/recruit.png",
  victorypoint: "/images/victorypoint.png",
}

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

export function ResourceIcon({
  type,
  size = "md",
  label,
  inline = false,
  className,
  ...props
}: ResourceIconProps) {
  const px = SIZE_MAP[size]

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        inline ? "inline-flex align-middle" : "",
        className
      )}
      title={type}
      {...props}
    >
      <div className="relative shrink-0" style={{ width: px, height: px }}>
        <Image
          src={RESOURCE_MAP[type]}
          alt={type}
          fill
          className="object-contain"
          sizes={`${px}px`}
        />
      </div>
      {label !== undefined && (
        <span
          className={cn(
            "font-mono font-medium tabular-nums whitespace-nowrap",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg"
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}
