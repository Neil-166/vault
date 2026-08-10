export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-start gap-1.5" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col gap-1.5">
          <div className={`h-1 rounded-full transition-colors ${i <= current ? 'bg-brand-600' : 'bg-ink-100'}`} />
          <span className={`text-[10.5px] font-medium ${i === current ? 'text-ink-800' : 'text-ink-300'}`}>{s}</span>
        </div>
      ))}
    </div>
  )
}
