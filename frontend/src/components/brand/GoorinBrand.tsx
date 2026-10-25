import { cn } from '@/lib/utils'

// The "G" glyph cropped from the official Goorin wordmark SVG (same path, viewBox 0 0 981 954).
const G_PATH =
  'M301.516 918.405C362.768 941.722 429.196 953.38 500.801 953.38C596.561 953.38 680.244 933.086 751.849 892.498C824.316 851.911 880.392 792.756 920.076 715.035C960.623 637.314 980.897 543.185 980.897 432.648V408.088C980.897 400.19 974.494 393.787 966.596 393.787L484.044 393.787C476.146 393.787 469.744 400.19 469.744 408.088L469.744 587.169C469.744 594.899 475.886 601.23 483.612 601.463L687.022 607.615C693.618 607.814 697.919 614.601 694.91 620.474V620.474C678.518 654.153 654.363 680.06 622.443 698.195C590.522 716.33 551.269 725.398 504.683 725.398C456.372 725.398 414.099 715.035 377.865 694.309C341.632 673.584 313.162 644.654 292.457 607.521C272.615 569.524 262.694 525.482 262.694 475.395C262.694 425.308 273.478 381.697 295.045 344.564C317.476 307.43 347.239 278.933 384.336 259.071C421.432 238.345 462.842 227.982 508.565 227.982C556.877 227.982 598.287 237.05 632.795 255.185C663.628 271.388 693.427 295.175 722.194 326.545C727.82 332.681 737.458 333.062 743.342 327.172L897.852 172.507C903.102 167.252 903.476 158.833 898.496 153.321C857.433 107.87 805.1 71.4431 741.496 44.042C674.205 14.6807 597.855 0 512.448 0C441.706 0 375.277 12.09 313.162 36.2699C251.047 59.5862 196.266 92.8336 148.817 136.012C102.231 178.327 65.5657 228.414 38.8218 286.273C12.9406 344.132 0 407.604 0 476.69C0 544.912 12.5092 607.952 37.5277 665.812C62.5462 723.671 97.4858 774.189 142.347 817.368C188.07 860.546 241.126 894.225 301.516 918.405Z'

export function GoorinMonogram({ size = 26, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 981 954" width={(size * 981) / 954} height={size} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} fill="currentColor">
      <path d={G_PATH} />
    </svg>
  )
}

export function GoorinCastle({ width = 26, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 2000 1550" width={width} height={Math.round((width * 1550) / 2000)} className={className} fill="currentColor" aria-hidden>
      <path d="M636 0H1351L1331 245L1245 310L1214 624L993 660L781 624L748 310L662 245Z" />
      <path d="M0 265H589L569 478L528 529L554 697L999 787L1445 697L1471 529L1431 471L1411 265H2000L1980 478L1920 511L1708 1343L999 1550L291 1343L79 516L19 478Z" />
    </svg>
  )
}

// Official wordmark, aspect 6.2:1. Width drives height; never stretched.
export function GoorinWordmark({ width = 160, tone = 'black', className, alt = 'Goorin Bros.' }: { width?: number; tone?: 'black' | 'cream'; className?: string; alt?: string }) {
  return <img src={`/images/brand/goorin-wordmark-${tone}.svg`} alt={alt} width={width} height={Math.round(width / 6.2)} className={cn('h-auto select-none', className)} style={{ width }} draggable={false} />
}
