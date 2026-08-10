'use client'
import { useEffect, useRef, useState } from 'react'
import type { Application as SplineApp } from '@splinetool/runtime'

interface SplineSceneProps {
  scene: string
  className?: string
}

/**
 * Mounts a Spline scene directly on `@splinetool/runtime`'s `Application`.
 *
 * The `@splinetool/react-spline` wrapper hardcodes `renderOnDemand: true`
 * (which maps to the throttled `auto` render mode) and silently ignores the
 * `renderMode` / `antialias` props — so a continuously-rotating scene feels
 * sluggish. Constructing the Application ourselves lets us opt into a
 * steady `continuous` frame loop and drop antialiasing on a near-black
 * scene for a clear GPU win.
 *
 * The runtime module is imported lazily inside the effect (client-only), so
 * this never touches `window`/`document` during SSR.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let app: SplineApp | null = null
    let disposed = false

    async function boot() {
      const { Application } = await import('@splinetool/runtime')
      if (disposed || !canvas) return

      // `antialias` isn't in the public constructor types yet, but the
      // runtime honors it — cast just the options through.
      app = new Application(
        canvas,
        {
          renderMode: 'continuous', // smooth 60fps rotation
          antialias: false, // page is near-black; cheaper
        } as unknown as ConstructorParameters<typeof Application>[1]
      )

      await app.load(scene)

      // Best-effort cap on pixel ratio so the GPU isn't oversampling.
      const renderer = (app as unknown as {
        renderer?: { setPixelRatio?: (n: number) => void }
      }).renderer
      renderer?.setPixelRatio?.(Math.min(window.devicePixelRatio || 1, 2))

      if (!disposed) setLoaded(true)
    }

    boot()

    return () => {
      disposed = true
      app?.dispose()
      app = null
    }
  }, [scene])

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="loader"></span>
        </div>
      )}
    </div>
  )
}
