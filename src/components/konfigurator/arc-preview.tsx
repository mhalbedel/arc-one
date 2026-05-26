import Image from 'next/image'

type ArcPreviewProps = {
  serialNumber: string
  photoUrl: string | null
}

export function ArcPreview({ serialNumber, photoUrl }: ArcPreviewProps) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`Arc ${serialNumber}`}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Kein Foto</span>
          </div>
        )}
      </div>
      <p className="font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground text-center">
        {serialNumber}
      </p>
    </div>
  )
}
