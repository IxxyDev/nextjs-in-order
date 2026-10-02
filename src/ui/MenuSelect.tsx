import { useEffect, useRef, useState } from 'preact/hooks'

export interface MenuOption { value: string; code: string; title: string }

const GUTTER = 16
const MAX_W = 420

export function MenuSelect({ id, label, placeholder, options, value, onChange }: { id: string; label: string; placeholder: string; options: MenuOption[]; value?: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState({ left: 0, width: MAX_W })
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const current = options.find((o) => o.value === value)

  const show = () => {
    const r = trigger.current!.getBoundingClientRect()
    const width = Math.min(MAX_W, innerWidth - GUTTER * 2)
    const left = Math.min(Math.max(r.left, GUTTER), innerWidth - GUTTER - width)
    setPos({ left: left - r.left, width })
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const close = (refocus: boolean) => { setOpen(false); if (refocus) trigger.current?.focus() }
  const pick = (i: number) => { close(true); if (options[i].value !== value) onChange(options[i].value) }

  useEffect(() => { if (open) list.current?.focus() }, [open])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) close(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])
  useEffect(() => { if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' }) }, [open, active])

  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); show() }
  }
  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') { close(true); return }
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(options.length - 1, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(options.length - 1),
      Enter: () => pick(active),
      ' ': () => pick(active),
      Escape: () => close(true)
    }
    if (!keys[e.key]) return
    e.preventDefault(); e.stopPropagation()
    keys[e.key]()
  }

  return (
    <div class="menu" ref={wrap}>
      <button
        ref={trigger} id={id} type="button" class="menu-trigger" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${current ? `${current.code} ${current.title}` : 'none selected'}`}
        onClick={() => (open ? close(false) : show())} onKeyDown={onTriggerKey}
      >
        <span class="menu-value">{current ? `${current.code} · ${current.title}` : placeholder}</span>
        <span class="menu-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul
          ref={list} class="menu-list" role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`${id}-opt-${active}`}
          style={{ left: `${pos.left}px`, width: `${pos.width}px` }} onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value} id={`${id}-opt-${i}`} role="option" aria-selected={o.value === value}
              class={`menu-option ${i === active ? 'is-active' : ''}`}
              onPointerMove={() => setActive(i)} onClick={() => pick(i)}
            >
              <span class="menu-code">{o.code}</span><span class="menu-title">{o.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
