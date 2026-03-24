import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f6f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          minHeight: "700px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "#fcfbf7",
          border: "1px solid #ece7de",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(70, 50, 30, 0.1)",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            position: "relative",
            padding: "40px",
            background:
              "linear-gradient(180deg, #f7f2e7 0%, #f1eadf 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "#4b2e22",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>

              <div style={{ lineHeight: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>
                  MY WORLD
                </div>
                <div style={{ fontSize: "11px", letterSpacing: "2px" }}>
                  FOOTPRINT
                </div>
              </div>
            </Link>
          </div>

          <div style={{ maxWidth: "460px" }}>
            <h1
              style={{
                fontSize: "56px",
                lineHeight: 1.04,
                fontWeight: 500,
                color: "#5a3425",
                margin: 0,
              }}
            >
              Track every trip.
              <br />
              See your footprint.
            </h1>

            <p
              style={{
                marginTop: "20px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#6e5b50",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Build a personal map of your travels, follow routes across the
              world, and turn your movement into meaningful stats.
            </p>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "270px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(130, 110, 90, 0.12)",
              boxShadow: "0 10px 30px rgba(60, 40, 20, 0.08)",
            }}
          >
            <Image
              src="/images/map.png"
              alt="World map"
              fill
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              }}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            padding: "56px 52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fffdfa",
          }}
        >
          <div style={{ width: "100%", maxWidth: "420px" }}>{children}</div>
        </div>
      </div>
    </main>
  );
}