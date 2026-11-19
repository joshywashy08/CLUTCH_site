// The zipper opening, rendered in Blender: FRAMES frames of FRAME_W x FRAME_H in one sheet, COLS per row.
// Frame 0 is closed, the last frame is fully unzipped.
import zipSheet from './assets/pocket-zip.webp'

export const FRAMES = 16
export const COLS = 4
export const FRAME_W = 640
export const FRAME_H = 979

// The sheet, fully decoded before first use so nothing flashes between frames.
export function loadSheet(): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = zipSheet
  return img.decode().then(() => img)
}

export function paintFrame(canvas: HTMLCanvasElement | null, img: HTMLImageElement | null, k: number) {
  const ctx = canvas?.getContext('2d')
  if (!ctx || !img) return
  ctx.clearRect(0, 0, FRAME_W, FRAME_H)
  ctx.drawImage(img, (k % COLS) * FRAME_W, Math.floor(k / COLS) * FRAME_H, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H)
}
