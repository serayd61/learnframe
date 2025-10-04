import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>🎓</div>
        <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
          LearnFrame
        </div>
        <div style={{ fontSize: 30, opacity: 0.8 }}>
          Learn & Earn on Base
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
