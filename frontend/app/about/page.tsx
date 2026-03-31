import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <main
      style={{
        background: "linear-gradient(180deg, #f7f4ec 0%, #ede4d4 100%)",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        color: "#4b2e22",
      }}
    >
      {/* ══ NAV ══════════════════════════════════════════ */}
      <nav
        className="nav-outer"
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
              <Image src="/images/logo.png" alt="Logo" fill style={{ objectFit: "contain" }} priority />
            </div>
            <span style={{ fontSize: 17, color: "#5b3926", letterSpacing: "0.2px" }}>
              My World Footprint
            </span>
          </Link>

          <div
            className="nav-links-row"
            style={{
              display: "flex",
              gap: 28,
              alignItems: "center",
              fontSize: 14,
              fontFamily: "Arial, sans-serif",
            }}
          >
            <Link href="/#features" className="nav-link nav-text-only" style={{ color: "#6c5a4d" }}>
              Features
            </Link>
            <Link href="/about" className="nav-link nav-text-only" style={{ color: "#b5792a" }}>
              About
            </Link>
            <a href="https://github.com/Mehulio123/WorldFootPrint" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#6c5a4d" }}>
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
        className="about-hero"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "96px 48px 64px",
          textAlign: "center",
        }}
      >
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
          <span style={{ fontSize: 15 }}>🗺️</span>
          <span
            style={{
              fontSize: 12,
              color: "#7a5738",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            The Story Behind the Map
          </span>
        </div>

        <h1
          className="about-h1"
          style={{
            fontSize: 58,
            lineHeight: 1.08,
            fontWeight: 500,
            margin: "0 0 28px 0",
            color: "#3d2314",
          }}
        >
          Built from a{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #b5792a 0%, #d4ac68 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            real idea.
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#7a5a3c",
            fontFamily: "Arial, sans-serif",
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          My World Footprint started with a simple physical object — a scratch-off world map.
          You know the ones: a big poster covered in gold foil, where you scratch away each
          country you've visited to reveal the colour underneath.
        </p>
      </section>

      {/* ══ STORY ════════════════════════════════════════ */}
      <section
        className="about-content"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 48px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {/* Inspiration block */}
        <div
          style={{
            background: "rgba(255,250,242,0.85)",
            border: "1px solid rgba(180,150,100,0.22)",
            borderRadius: 24,
            padding: "40px 44px",
            boxShadow: "0 8px 24px rgba(85,60,30,0.06)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 18 }}>🧲</div>
          <h2 style={{ fontSize: 26, color: "#5b3926", margin: "0 0 16px 0", fontWeight: 500 }}>
            The scratch-off map that started it all
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#7a5a3c",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            There&apos;s something satisfying about scratching off a country you&apos;ve been to — it makes travel feel
            tangible and visible. But physical maps have limits: they can&apos;t tell you when you went, how
            you got there, or what impact the journey had on the planet. We wanted to take that same
            feeling of &quot;marking your world&quot; and bring it into the digital age — with routes, timelines,
            and real carbon data to go with it.
          </p>
        </div>

        {/* What it is */}
        <div
          style={{
            background: "rgba(255,250,242,0.85)",
            border: "1px solid rgba(180,150,100,0.22)",
            borderRadius: 24,
            padding: "40px 44px",
            boxShadow: "0 8px 24px rgba(85,60,30,0.06)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 18 }}>🌍</div>
          <h2 style={{ fontSize: 26, color: "#5b3926", margin: "0 0 16px 0", fontWeight: 500 }}>
            What My World Footprint is
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#7a5a3c",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            It&apos;s a travel intelligence platform where you log every trip you&apos;ve taken — broken into
            segments by transport mode — and watch them come alive on a 3D interactive globe. Visited
            countries fill in automatically. Flight arcs animate across continents. And behind every
            journey, you get a carbon footprint breakdown so you can understand the real-world cost of
            your adventures, with comparisons like how many trees it would take to offset the emissions.
          </p>
        </div>

        {/* Open source */}
        <div
          style={{
            background: "rgba(255,250,242,0.85)",
            border: "1px solid rgba(180,150,100,0.22)",
            borderRadius: 24,
            padding: "40px 44px",
            boxShadow: "0 8px 24px rgba(85,60,30,0.06)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 18 }}>⚙️</div>
          <h2 style={{ fontSize: 26, color: "#5b3926", margin: "0 0 16px 0", fontWeight: 500 }}>
            Open source & built in public
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#7a5a3c",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.8,
              margin: "0 0 28px 0",
            }}
          >
            The full source code is available on GitHub. Built with Next.js on the frontend,
            NestJS on the backend, and Mapbox for the globe — all deployable on Vercel and Railway.
            Feel free to explore the code, report issues, or contribute.
          </p>

          <a
            href="https://github.com/Mehulio123/WorldFootPrint"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#3d2314",
              color: "#fffdf8",
              borderRadius: 12,
              padding: "12px 24px",
              textDecoration: "none",
              fontFamily: "Arial, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(40,20,8,0.18)",
              transition: "opacity 0.15s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════ */}
      <section className="about-cta" style={{ maxWidth: 760, margin: "0 auto", padding: "0 48px 96px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #3d2314 0%, #5b3926 45%, #3d2314 100%)",
            borderRadius: 28,
            padding: "64px 56px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 28px 64px rgba(40,20,8,0.22)",
          }}
        >
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(181,121,42,0.1)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(181,121,42,0.07)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>✈️</div>
            <h2 style={{ fontSize: 40, color: "#fffdf8", margin: "0 0 14px 0", fontWeight: 500, lineHeight: 1.1 }}>
              Ready to map your world?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,253,248,0.65)", fontFamily: "Arial, sans-serif", margin: "0 0 36px 0", lineHeight: 1.6 }}>
              Start logging your journeys and see where life has taken you.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/signup" className="btn-gold" style={{ fontSize: 16, padding: "13px 32px" }}>
                Get Started Free
              </Link>
              <Link
                href="/map-demo"
                style={{
                  fontSize: 16,
                  padding: "13px 32px",
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
