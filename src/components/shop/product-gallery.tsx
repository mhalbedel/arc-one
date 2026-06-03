'use client'

import { createElement, useState } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type ProductGalleryProps = {
  name: string
  images: string[]
  model3dUrl: string | null
}

function PhotoGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Kein Foto verfügbar
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={images[active]}
          alt={`${name} — Bild ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1} anzeigen`}
              className={cn(
                'relative aspect-square overflow-hidden bg-muted transition-opacity',
                i === active ? 'ring-1 ring-foreground' : 'opacity-70 hover:opacity-100',
              )}
            >
              <Image src={url} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductGallery({ name, images, model3dUrl }: ProductGalleryProps) {
  if (!model3dUrl) {
    return <PhotoGallery name={name} images={images} />
  }

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
      />
      <Tabs defaultValue="fotos" className="w-full">
        <TabsList className="mb-4 bg-muted/50 h-8">
          <TabsTrigger value="fotos" className="text-xs tracking-widest uppercase">
            Fotos
          </TabsTrigger>
          <TabsTrigger value="3d" className="text-xs tracking-widest uppercase">
            3D-Modell
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fotos" className="mt-0">
          <PhotoGallery name={name} images={images} />
        </TabsContent>
        <TabsContent value="3d" className="mt-0">
          <div className="aspect-square overflow-hidden bg-muted">
            {createElement('model-viewer', {
              src: model3dUrl,
              alt: `3D-Modell von ${name}`,
              'camera-controls': true,
              'auto-rotate': true,
              'touch-action': 'pan-y',
              style: { width: '100%', height: '100%' },
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
