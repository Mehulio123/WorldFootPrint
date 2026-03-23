import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        background: "#f8f6f0",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        color: "#4b2e22",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid #ece7de",
        }}
      >
        {/* LEFT LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 100,
              height: 100,
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

        </div>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            gap: "34px",
            alignItems: "center",
            fontSize: "16px",
            color: "#6c5a4d",
          }}
        >
          <a href="#">About Us</a>
          <a href="#">Github</a>
          <a href="#">Log In</a>
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "0.9fr 1.25fr",
          alignItems: "center",
          padding: "48px 36px 24px 36px",
          minHeight: "620px",
          overflow: "hidden",
        }}
      >
        {/* LEFT TEXT */}
        <div style={{ position: "relative", zIndex: 6 }}>
          <h1
            style={{
              fontSize: "72px",
              lineHeight: 1.03,
              fontWeight: 500,
              margin: 0,
              color: "#5a3425",
            }}
          >
            Welcome to My
            <br />
            World Footprint
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "26px",
              maxWidth: "255px",
            }}
          >
            {/* DEMO BUTTON */}
            <button
              style={{
                background: "linear-gradient(180deg, #d4ac68 0%, #b9853f 100%)",
                color: "#fffdf8",
                padding: "14px 28px",
                borderRadius: "14px",
                border: "1px solid rgba(166,118,52,0.55)",
                fontSize: "22px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 14px rgba(184,133,63,0.22)",
                cursor: "pointer",
              }}
            >
              Demo
            </button>

            {/* SIGN UP BUTTON */}
            <button
              style={{
                background: "rgba(255,255,255,0.72)",
                color: "#6b5a4c",
                border: "1.5px dashed #c7b8aa",
                padding: "14px 28px",
                borderRadius: "14px",
                fontSize: "22px",
                boxShadow: "0 2px 10px rgba(80,60,40,0.05)",
                cursor: "pointer",
              }}
            >
              Sign-up
            </button>
          </div>
        </div>

        {/* MAP */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "110%",
            marginLeft: "10px",
            //overflow: "hidden",
            borderRadius: "4px",
          }}
        >
          <Image
            src="/images/map.png"
            alt="World map"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* BACK SHADE (behind) */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "40%",
            width: "240px",
            height: "720px",
            background: "rgba(226,224,229,0.5)",
            transform: "skewX(-34deg)",
            zIndex: 2,
          }}
        />

        {/* WHITE MAIN SLANT */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "25%",
            width: "340px",
            height: "760px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,241,237,0.9))",
            transform: "skewX(-34deg)",
            zIndex: 4,
            boxShadow: "18px 0 34px rgba(120,110,100,0.08)",
          }}
        />
      </div>

      {/* ABOUT */}
      <div style={{ padding: "30px 40px 60px 40px" }}>
        <div
          style={{
            width: "66px",
            height: "66px",
            border: "2px solid #ccb998",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            color: "#b59463",
          }}
        >
          Compass
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "42px",
          }}
        >
          <div style={{ borderRight: "1px solid #e2ddd4" }}>
            <h2 style={{ fontSize: "52px" }}>
              What is My World Footprint?
            </h2>
            <p style={{ fontFamily: "Arial" }}>
              Lorem ipsum dolor sit amet...
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: "42px" }}>Mock Travel Recap</h3>

            <div style={cardStyle}>Your Footprint</div>
            <div style={cardStyle}>Countries Traveled: 15 🌍</div>
            <div style={cardStyle}>Most Visited: Japan 🇯🇵</div>
          </div>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "15px 18px",
  marginBottom: "12px",
  borderRadius: "6px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};