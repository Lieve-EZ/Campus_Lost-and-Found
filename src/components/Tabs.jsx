export default function Tabs({ value, onChange }) {
  const tabs = [['', 'All items'], ['lost', 'Lost'], ['found', 'Found']]
  return <div className="flex border-b border-ink/15">
    {tabs.map(([key, label]) => <button key={key || 'all'} onClick={() => onChange(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${value === key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}>{label}</button>)}
  </div>
}
