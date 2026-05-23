import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#003249",
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 700,
          color: "#9ad1d4",
        }}
      >
        #
      </div>
    ),
    { ...size },
  );
}
