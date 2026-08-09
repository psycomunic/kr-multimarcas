export default function CarregandoCatalogo() {
  return (
    <div className="container-kr py-8 sm:py-12">
      <div className="skeleton h-8 w-56 rounded-lg" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-6 lg:block">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] rounded-2xl" />
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
