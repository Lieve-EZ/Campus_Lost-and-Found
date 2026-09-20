const steps = [['01', 'Post a detail', 'Share what went missing or what you found, with the details that help it stand out.'], ['02', 'Let the board connect dots', 'Our matching system quietly looks for similar descriptions across campus.'], ['03', 'Make the handoff', 'A likely match gives both sides a clear starting point to reconnect.']]

export default function HowItWorks() {
  return <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8"><div className="max-w-xl"><p className="eyebrow">How it works</p><h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">A small post can make a big difference.</h2></div><div className="mt-12 grid gap-10 md:grid-cols-3">{steps.map(([number, title, body]) => <div key={number} className="border-t-2 border-ink pt-5"><span className="font-display text-sm font-bold text-sage">{number}</span><h3 className="mt-5 font-display text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{body}</p></div>)}</div></section>
}
