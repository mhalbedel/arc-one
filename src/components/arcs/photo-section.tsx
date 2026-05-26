'use client'

import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PhotoSectionProps = {
  serialNumber: string
  frontUrl: string | null
  backUrl: string | null
}

export function PhotoSection({ serialNumber, frontUrl, backUrl }: PhotoSectionProps) {
  if (!frontUrl && !backUrl) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Kein Foto verfügbar
        </span>
      </div>
    )
  }

  if (!backUrl || !frontUrl) {
    const url = frontUrl ?? backUrl!
    const label = frontUrl ? 'Seite A' : 'Seite B'
    return (
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={url}
          alt={`Arc ${serialNumber} — ${label}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <Tabs defaultValue="front" className="w-full">
      <TabsList className="mb-4 bg-muted/50 h-8">
        <TabsTrigger value="front" className="text-xs tracking-widest uppercase">
          Seite A
        </TabsTrigger>
        <TabsTrigger value="back" className="text-xs tracking-widest uppercase">
          Seite B
        </TabsTrigger>
      </TabsList>
      <TabsContent value="front" className="mt-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={frontUrl}
            alt={`Arc ${serialNumber} — Seite A`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </TabsContent>
      <TabsContent value="back" className="mt-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={backUrl}
            alt={`Arc ${serialNumber} — Seite B`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
