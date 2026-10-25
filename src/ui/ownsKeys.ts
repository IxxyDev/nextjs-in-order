/** focus here owns every key */
const OWNERS = 'input, textarea, select, [role=option], [role=listbox]'

/** a key pressed in a text field, a list box or editable content belongs to it, not to the page's shortcuts */
export function ownsKeys(target: HTMLElement): boolean {
  return target.isContentEditable || !!target.closest?.(OWNERS)
}
