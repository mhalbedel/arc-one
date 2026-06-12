/**
 * Die offizielle ARC-ONE Wortmarke ("05 Arc Initial"): der Clay-Bogen sitzt auf
 * der Grundlinie der Wortmarke und schwingt ueber das "A" von ARC-ONE.
 * Proportionen exakt aus dem Design-System (guidelines/brand-logo.card.html):
 * 30px Wortmarke -> Bogenbreite 100, viewBox 0 0 64 46, bottom -3px (Ratio 100/30).
 * Bei text-lg (18px): Breite 60px, Hoehe ~43px, bottom -1.8px. So schwingt der Bogen
 * sauber ueber das "A", statt es zu ueberlappen.
 * Der Bogen ist rein dekorativ (aria-hidden); der lesbare Markenname bleibt "ARC-ONE".
 */
export function Wordmark() {
  return (
    <span className="relative font-serif text-lg tracking-[0.18em] font-medium uppercase leading-none whitespace-nowrap">
      <span className="relative inline-block">
        <svg
          viewBox="0 0 64 46"
          fill="none"
          aria-hidden="true"
          className="absolute left-1/2 bottom-[-1.8px] h-[43px] w-[60px] -translate-x-1/2 overflow-visible pointer-events-none"
        >
          <path
            d="M8 40 A 22 22 0 0 1 40 12"
            stroke="hsl(var(--accent))"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        A
      </span>
      RC-ONE
    </span>
  )
}
