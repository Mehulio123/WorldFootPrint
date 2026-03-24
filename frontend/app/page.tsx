import Image from "next/image";
import Link from "next/link";
import { HeroCard } from "@/components/HeroCard";

const features = [
  {
    icon: "🌍",
    title: "Track Every Journey",
    desc: "Log trips with multiple segments, transport modes, and destinations — anywhere across all 195 countries.",
  },
  {
    icon: "🗺️",
    title: "Visualize Your World",
    desc: "Watch your routes come alive on a 3D globe with animated arcs, visited country shading, and city labels.",
  },
  {
    icon: "🌱",
    title: "Measure Your Impact",
    desc: "Get a full carbon breakdown by transport mode, with real-world comparisons like trees needed to offset.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        background: "linear-gradient(180deg, #f7f4ec 0%, #ede4d4 100%)",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        color: "#4b2e22",
        overflowX: "hidden",
      }}
    >
      {/* ══ STICKY NAV ══════════════════════════════════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(247,244,236,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(180,150,100,0.14)",
          padding: "0 48px",
        }}
      >
        <div
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 70,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
              <Image src="/images/logo.png" alt="Logo" fill style={{ objectFit: "contain" }} priority />
            </div>
            <span style={{ fontSize: 17, color: "#5b3926", letterSpacing: "0.2px" }}>
              My World Footprint
            </span>
          </div>

          {/* Links */}
          <div
            style={{
              display: "flex",
              gap: 28,
              alignItems: "center",
              fontSize: 14,
              fontFamily: "Arial, sans-serif",
            }}
          >
            <a href="#features" className="nav-link" style={{ color: "#6c5a4d" }}>
              Features
            </a>
            <a href="#" className="nav-link" style={{ color: "#6c5a4d" }}>
              About
            </a>
            <a href="#" className="nav-link" style={{ color: "#6c5a4d" }}>
              Github
            </a>
            <Link
              href="/auth/login"
              className="btn-pill"
              style={{
                color: "#7a5738",
                border: "1px solid rgba(170,140,95,0.3)",
                borderRadius: 999,
                padding: "7px 20px",
                textDecoration: "none",
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
              }}
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-gold"
              style={{ borderRadius: 999, padding: "8px 22px", fontSize: 14 }}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "80px 48px 72px",
          display: "grid",
          gridTemplateColumns: "1fr 1.08fr",
          gap: 72,
          alignItems: "center",
          minHeight: "calc(92vh - 70px)",
        }}
      >
        {/* Left col */}
        <div className="fade-up">
          {/* Badge chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(181,121,42,0.1)",
              border: "1px solid rgba(181,121,42,0.28)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 15 }}>✈️</span>
            <span
              style={{
                fontSize: 12,
                color: "#7a5738",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              Travel Intelligence Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: 74,
              lineHeight: 1.04,
              fontWeight: 500,
              margin: "0 0 26px 0",
              color: "#3d2314",
            }}
          >
            Every journey
            <br />
            <span style={{
              background: "linear-gradient(135deg, #b5792a 0%, #d4ac68 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>leaves a mark.</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#7a5a3c",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.75,
              maxWidth: 430,
              margin: "0 0 44px 0",
            }}
          >
            Log your trips, visualize your routes on a 3D globe, and understand
            the carbon footprint of every adventure you take.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/auth/signup"
              className="btn-gold"
              style={{ fontSize: 17, padding: "15px 36px" }}
            >
              Start for Free
            </Link>
            <Link
              href="/map-demo"
              className="btn-ghost"
              style={{ fontSize: 17, padding: "15px 36px" }}
            >
              Explore Demo →
            </Link>
          </div>

        </div>

        {/* Right col — browser mockup */}
        <div className="fade-up-delay-1" style={{ position: "relative" }}>
          {/* Tiltable map card */}
          <HeroCard>
            <div
              style={{
                background: "rgba(255,252,245,0.97)",
                border: "1px solid rgba(180,150,100,0.22)",
                borderRadius: 22,
                boxShadow:
                  "0 40px 90px rgba(50,30,10,0.22), 0 8px 20px rgba(50,30,10,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 16px",
                  background: "rgba(238,228,212,0.85)",
                  borderBottom: "1px solid rgba(180,150,100,0.14)",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff6b6b", opacity: 0.75 }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffd93d", opacity: 0.75 }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6bcb77", opacity: 0.75 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.62)",
                      borderRadius: 6,
                      padding: "3px 18px",
                      fontSize: 11,
                      color: "#9b7a4d",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    myworldfootprint.com/map
                  </div>
                </div>
              </div>

              {/* Map image */}
              <div style={{ position: "relative", height: 360 }}>
                <Image
                  src="/images/map.png"
                  alt="World map preview"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(255,252,245,0.35) 100%)",
                  }}
                />
              </div>
            </div>
          </HeroCard>

          {/* Floating card A — static, layered above the map */}
          <div
            className="float-a"
            style={{
              position: "absolute",
              top: 52,
              right: -28,
              background: "rgba(255,252,245,0.97)",
              border: "1px solid rgba(180,150,100,0.2)",
              borderRadius: 22,
              padding: "14px 20px",
              boxShadow: "0 14px 36px rgba(60,40,20,0.14)",
              backdropFilter: "blur(10px)",
              minWidth: 130,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9b7a4d",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 5,
              }}
            >
              Countries
            </div>
            <div style={{ fontSize: 28, color: "#5b3926", lineHeight: 1 }}>
              42 🌍
            </div>
          </div>

          {/* Floating card B — static, layered above the map */}
          <div
            className="float-b"
            style={{
              position: "absolute",
              bottom: 48,
              left: -28,
              background: "rgba(255,252,245,0.97)",
              border: "1px solid rgba(180,150,100,0.2)",
              borderRadius: 18,
              padding: "14px 20px",
              boxShadow: "0 14px 36px rgba(60,40,20,0.14)",
              backdropFilter: "blur(10px)",
              minWidth: 150,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9b7a4d",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 5,
              }}
            >
              Carbon tracked
            </div>
            <div style={{ fontSize: 26, color: "#5b3926", lineHeight: 1 }}>
              1.2k{" "}
              <span style={{ fontSize: 13, color: "#9b7a4d" }}>kg CO₂</span>
            </div>
          </div>

          {/* Floating card C — static, layered above the map */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              right: -20,
              background: "rgba(240,253,244,0.97)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 18,
              padding: "12px 18px",
              boxShadow: "0 14px 36px rgba(60,40,20,0.1)",
              backdropFilter: "blur(10px)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#4d7c0f",
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 5,
              }}
            >
              Trips logged
            </div>
            <div style={{ fontSize: 24, color: "#166534", lineHeight: 1 }}>
              🧳 10
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════ */}
      <section
        id="features"
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "140px 48px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              color: "#9b7a4d",
              fontFamily: "Arial, sans-serif",
              marginBottom: 14,
            }}
          >
            What you can do
          </p>
          <h2 style={{ fontSize: 42, margin: 0, color: "#3d2314", fontWeight: 500 }}>
            Built for the curious traveler
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="card-lift fade-up-delay-2"
              style={{
                background: "rgba(255,250,242,0.82)",
                border: "1px solid rgba(180,150,100,0.2)",
                borderRadius: 24,
                padding: "36px 32px",
                boxShadow: "0 8px 24px rgba(85,60,30,0.06)",
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, color: "#5b3926", margin: "0 0 14px 0" }}>
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "#8b6a46",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DARK CTA ════════════════════════════════════ */}
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "0 48px 96px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #3d2314 0%, #5b3926 45%, #3d2314 100%)",
            borderRadius: 32,
            padding: "80px 64px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 28px 64px rgba(40,20,8,0.22)",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute", top: -80, right: -80,
              width: 320, height: 320, borderRadius: "50%",
              background: "rgba(181,121,42,0.1)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: -50, left: -50,
              width: 240, height: 240, borderRadius: "50%",
              background: "rgba(181,121,42,0.07)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute", top: "30%", left: "20%",
              width: 160, height: 160, borderRadius: "50%",
              background: "rgba(255,255,255,0.025)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 54, marginBottom: 18 }}>🌍</div>
            <h2
              style={{
                fontSize: 50,
                color: "#fffdf8",
                margin: "0 0 16px 0",
                fontWeight: 500,
                lineHeight: 1.1,
              }}
            >
              Start mapping your world
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "rgba(255,253,248,0.65)",
                fontFamily: "Arial, sans-serif",
                margin: "0 0 44px 0",
                lineHeight: 1.6,
              }}
            >
              Join explorers tracking every journey, continent by continent.
            </p>
            <div
              style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link
                href="/auth/signup"
                className="btn-gold"
                style={{ fontSize: 17, padding: "15px 38px" }}
              >
                Create Free Account
              </Link>
              <Link
                href="/map-demo"
                className="btn-pill"
                style={{
                  fontSize: 17,
                  padding: "15px 38px",
                  color: "rgba(255,253,248,0.8)",
                  border: "1.5px solid rgba(255,253,248,0.22)",
                  borderRadius: 14,
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.07)",
                  fontFamily: "Arial, sans-serif",
                  display: "inline-block",
                }}
              >
                Try Demo First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
