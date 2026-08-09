export default function CarregandoProduto() {
  return (
    <div className="container-kr py-8 sm:py-12">
      <div className="skeleton h-3 w-64 rounded" />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="skeleton aspect-[3/4] rounded-3xl" />
          <div className="mt-3 flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 w-20 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-9 w-40 rounded-lg" />
          <div className="space-y-2 pt-4">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-11 w-12 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
