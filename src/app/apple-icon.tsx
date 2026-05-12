import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 44,
          background:
            "linear-gradient(145deg, rgb(31,41,55) 0%, rgb(15,23,42) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.14)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 46,
            top: 48,
            width: 90,
            height: 90,
            borderRadius: 28,
            background:
              "linear-gradient(145deg, rgb(103,232,249) 0%, rgb(96,165,250) 100%)",
            clipPath: "polygon(0 0, 100% 0, 55% 45%, 0 45%)",
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 94,
            width: 98,
            height: 48,
            borderRadius: 24,
            background:
              "linear-gradient(145deg, rgb(147,197,253) 0%, rgb(165,180,252) 100%)",
            transform: "skewX(18deg)",
            opacity: 0.92,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 68,
              height: 14,
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
            }}
          />
          <div
            style={{
              width: 44,
              height: 14,
              borderRadius: 999,
              background: "rgba(255,255,255,0.72)",
            }}
          />
        </div>
      </div>
    ),
    size,
  )
}
