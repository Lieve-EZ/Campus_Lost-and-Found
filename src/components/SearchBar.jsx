export default function SearchBar({ value, onChange }) {
  return <label className="relative block flex-1">
    <span className="sr-only">Search the board</span>
    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-lg text-muted" aria-hidden="true">🔎</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="field mt-0 w-full pl-11" placeholder="Search by title, place, or detail..." />
  </label>
}
