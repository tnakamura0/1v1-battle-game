export function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-text-primary">
      <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
      {title}
    </h2>
  )
}
