// Frame sheets rendered in Blender, painted onto a canvas one frame at a time.
// Each sheet is a grid of equal frames, `cols` per row; frame 0 is the closed pouch.
import turnSheet from './assets/pocket-turn.webp'
import zipSheet from './assets/pocket-zip.webp'

export type Sheet = { src: string; frames: number; cols: number; w: number; h: number }

// Home page: the zipper sliding down, seen from the front.
export const ZIP: Sheet = { src: zipSheet, frames: 16, cols: 4, w: 640, h: 979 }
// Explore page: the zipper sliding down while the pouch turns 70 degrees, so we end up looking at its right side.
export const TURN: Sheet = { src: turnSheet, frames: 20, cols: 5, w: 640, h: 1006 }

// The sheet, fully decoded before first use so nothing flashes between frames.
export function loadSheet(sheet: Sheet): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = sheet.src
  return img.decode().then(() => img)
}

export function paintFrame(canvas: HTMLCanvasElement | null, img: HTMLImageElement | null, sheet: Sheet, k: number) {
  const ctx = canvas?.getContext('2d')
  if (!ctx || !img) return
  ctx.clearRect(0, 0, sheet.w, sheet.h)
  ctx.drawImage(img, (k % sheet.cols) * sheet.w, Math.floor(k / sheet.cols) * sheet.h, sheet.w, sheet.h, 0, 0, sheet.w, sheet.h)
}
