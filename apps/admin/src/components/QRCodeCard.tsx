'use client'
import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'

interface Props {
  partnerId: string
  partnerName: string
}

export default function QRCodeCard({ partnerId, partnerName }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const value = `serendigo://redeem/${partnerId}`

  const downloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `serendigo-qr-${partnerName.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  const print = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>SerendiGO QR — ${partnerName}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
            img { width: 280px; height: 280px; }
            h2 { margin: 16px 0 4px; font-size: 18px; color: #1A1A2E; }
            p { margin: 0; font-size: 12px; color: #888; }
            .badge { margin-top: 12px; background: #E8832A; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body onload="window.print()">
          <img src="${dataUrl}" />
          <h2>${partnerName}</h2>
          <p>Scan with SerendiGO to redeem coins</p>
          <div class="badge">SerendiGO Partner</div>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
          📱 Partner QR Code
        </h2>
      </div>

      <p className="text-xs text-gray-500">
        Print this QR code and display it at your counter. Travelers scan it with SerendiGO to spend coins and get discounts.
      </p>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-4">
        <div
          ref={canvasRef}
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
        >
          <QRCodeCanvas
            value={value}
            size={200}
            level="M"
            marginSize={1}
            imageSettings={{
              src: '/icon.png',
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">{partnerName}</p>
          <p className="text-xs text-gray-400 mt-0.5">SerendiGO Coin Redemption</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <button
            onClick={downloadPNG}
            className="flex-1 flex items-center justify-center gap-2 btn-secondary text-sm"
          >
            <Download size={14} />
            Download PNG
          </button>
          <button
            onClick={print}
            className="flex-1 flex items-center justify-center gap-2 btn-secondary text-sm"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 font-mono break-all">
        {value}
      </div>
    </div>
  )
}
