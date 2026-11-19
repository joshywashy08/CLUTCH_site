// The zipper opening as Blender frames in one sheet, painted onto a canvas one frame at a time.
// Used by the home page, and by the explore page when the browser cannot draw 3D.
import zipSheet from './assets/pocket-zip.webp'

export type Sheet = { src: string; frames: number; cols: number; w: number; h: number }

// The zipper sliding down, seen from the front. Frame 0 is closed, the last frame is fully unzipped.
export const ZIP: Sheet = { src: zipSheet, frames: 16, cols: 4, w: 640, h: 979 }

// The sheet, fully decoded before first use so nothing flashes between frames.
export function loadSheet(sheet: Sheet): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = sheet.src
  return img.decode().then(() => img)
}

// Paint frame k of a sheet so it fills the canvas.
export function paintFrame(canvas: HTMLCanvasElement | null, img: HTMLImageElement | null, sheet: Sheet, k: number) {
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx || !img) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, (k % sheet.cols) * sheet.w, Math.floor(k / sheet.cols) * sheet.h, sheet.w, sheet.h, 0, 0, canvas.width, canvas.height)
}
