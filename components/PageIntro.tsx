export default function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="bg-ink py-20 text-ivory md:py-28">
      <div className="container-shell">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="display mt-6 max-w-4xl text-5xl leading-[1.04] md:text-7xl">{title}</h1>
        <div className="gold-rule mt-8" />
        <p className="mt-7 max-w-2xl text-base leading-8 text-silver">{description}</p>
      </div>
    </section>
  );
}
