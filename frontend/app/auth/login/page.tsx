import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            margin: 0,
            color: "#b9853f",
            fontSize: "14px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Welcome back
        </p>

        <h2
          style={{
            margin: "10px 0 0 0",
            fontSize: "44px",
            lineHeight: 1.08,
            fontWeight: 500,
            color: "#4b2e22",
          }}
        >
          Log in to your account
        </h2>
      </div>

      <form style={{ display: "grid", gap: "18px" }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "15px",
              color: "#6a584d",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="ankit@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: "15px",
                color: "#6a584d",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Password
            </label>

            <a
              href="#"
              style={{
                fontSize: "13px",
                color: "#b9853f",
                textDecoration: "none",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Forgot password?
            </a>
          </div>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            style={inputStyle}
          />
        </div>

        <button type="submit" style={primaryButtonStyle}>
          Log In
        </button>
      </form>

      <p
        style={{
          marginTop: "22px",
          fontSize: "15px",
          color: "#6e5b50",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          style={{
            color: "#b9853f",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #ded7cc",
  background: "#fff",
  fontSize: "16px",
  outline: "none",
  fontFamily: "Arial, sans-serif",
  color: "#4b2e22",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: "8px",
  background: "linear-gradient(180deg, #d4ac68 0%, #b9853f 100%)",
  color: "#fffdf8",
  padding: "15px 20px",
  borderRadius: "14px",
  border: "1px solid rgba(166,118,52,0.55)",
  fontSize: "18px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 18px rgba(184,133,63,0.2)",
};