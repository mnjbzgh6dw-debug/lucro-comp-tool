import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

// Small accessible "?" tooltip built on Headless UI Popover.
export default function Tooltip({ text }) {
  if (!text) return null
  return (
    <Popover className="relative inline-block">
      <PopoverButton
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-navy/10 text-[10px] font-bold text-navy/70 outline-none hover:bg-navy/20 focus:ring-2 focus:ring-gold/50"
        aria-label="More info"
      >
        ?
      </PopoverButton>
      <PopoverPanel
        anchor="top"
        className="z-50 max-w-xs rounded-lg bg-navy px-3 py-2 text-xs leading-snug text-white shadow-lg"
      >
        {text}
      </PopoverPanel>
    </Popover>
  )
}
