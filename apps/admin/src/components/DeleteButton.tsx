'use client'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteButton({
  action,
  confirmMessage,
  label = 'Delete',
  className = 'btn-danger',
}: {
  action: () => Promise<void>
  confirmMessage: string
  label?: string
  className?: string
}) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm(confirmMessage)) return
    startTransition(() => { action() })
  }

  return (
    <button onClick={handleClick} disabled={isPending} className={className}>
      <Trash2 size={14} />
      {label}
    </button>
  )
}
