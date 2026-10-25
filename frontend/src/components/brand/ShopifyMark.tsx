// Official Shopify bag mark (Simple Icons, CC0, #95BF47). Shown as-is on light backgrounds; never recolored.
export function ShopifyMark({ size = 16, decorative = false, className, testId }: { size?: number; decorative?: boolean; className?: string; testId?: string }) {
  return (
    <img
      src="/images/brand/shopify-bag.svg"
      width={size}
      height={size}
      alt={decorative ? '' : 'Shopify'}
      aria-hidden={decorative || undefined}
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
      data-testid={testId}
    />
  )
}
