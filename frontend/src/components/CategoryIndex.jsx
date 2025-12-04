import { useMemo } from "react"

const slugify = (s="") => s.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "")

export default function CategoryIndex({ sections = [] }) {
  const items = useMemo(
    () => sections.map(s => ({ id: slugify(s.title), title: s.title })),
    [sections]
  )

  if (!items.length) return null

  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 mb-4">
      <div className="container mx-auto px-3 md:px-6 lg:px-8 py-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {items.map(it => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="px-3 py-2 rounded-full text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 whitespace-nowrap"
            >
              {it.title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
