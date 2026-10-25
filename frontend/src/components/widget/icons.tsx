import { Headset, HelpCircle, Mail, MessageCircle } from 'lucide-react'
import type { LauncherIcon } from '@/types'

export function HatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 15.5c2.2-.9 5.6-1.4 9.5-1.4s7.3.5 9.5 1.4c-1.3 1.6-5 2.6-9.5 2.6s-8.2-1-9.5-2.6z" />
      <path d="M6.6 14.6C6.8 9.4 8.6 6 12 6s5.2 3.4 5.4 8.6" />
      <path d="M6.8 12.4c1.6-.4 3.3-.6 5.2-.6s3.6.2 5.2.6" />
    </svg>
  )
}

export function LauncherGlyph({ icon, customUrl, size }: { icon: LauncherIcon; customUrl: string | null; size: number }) {
  if (icon === 'custom' && customUrl) return <img className="gw-custom-icon" src={customUrl} alt="" />
  const props = { size, strokeWidth: 1.9, 'aria-hidden': true }
  if (icon === 'chat') return <MessageCircle {...props} />
  if (icon === 'question') return <HelpCircle {...props} />
  if (icon === 'envelope') return <Mail {...props} />
  if (icon === 'headset') return <Headset {...props} />
  return <HatIcon size={size} />
}
