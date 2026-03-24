import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f7f4ec 0%, #efe7da 100%)',
        fontFamily: 'Georgia, serif',
        color: '#4b2e22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 24px' }}>
          <Image src="/images/logo.png" alt="logo" fill style={{ objectFit: 'contain' }} />
        </div>

        <div style={{ fontSize: 96, lineHeight: 1, color: '#c7ab79', marginBottom: 8 }}>
          404
        </div>

        <h1 style={{ fontSize: 32, margin: '0 0 14px', color: '#5b3926' }}>
          This route is uncharted
        </h1>

        <p
          style={{
            fontSize: 16,
            color: '#8b6a46',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.7,
            margin: '0 0 36px',
          }}
        >
          The page you're looking for doesn't exist — but the rest of the world is still
          waiting to be explored.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-gold" style={{ fontSize: 15, padding: '12px 28px' }}>
            Go Home
          </Link>
          <Link href="/map-demo" className="btn-ghost" style={{ fontSize: 15, padding: '12px 28px' }}>
            Try Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
