import {
  ArrowLeftRight,
  Car,
  Clapperboard,
  HeartPulse,
  PiggyBank,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '../../types'

export const CATEGORY_META: Record<Category, { icon: LucideIcon; hue: number }> = {
  Food: { icon: UtensilsCrossed, hue: 20 },
  Transport: { icon: Car, hue: 210 },
  Shopping: { icon: ShoppingBag, hue: 280 },
  Bills: { icon: ReceiptText, hue: 45 },
  Entertainment: { icon: Clapperboard, hue: 320 },
  Groceries: { icon: ShoppingCart, hue: 152 },
  Health: { icon: HeartPulse, hue: 0 },
  Transfer: { icon: ArrowLeftRight, hue: 232 },
  Savings: { icon: PiggyBank, hue: 152 },
  Other: { icon: Wallet, hue: 220 },
}

export function CategoryIcon({
  category,
  size = 40,
}: {
  category: Category
  size?: number
}) {
  const { icon: Icon, hue } = CATEGORY_META[category] ?? CATEGORY_META.Other
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 68% 95%)`,
        color: `hsl(${hue} 55% 40%)`,
      }}
      aria-hidden
    >
      <Icon size={size * 0.48} />
    </span>
  )
}
