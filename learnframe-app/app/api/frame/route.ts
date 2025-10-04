import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const frameHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/og" />
  <meta property="fc:frame:button:1" content="Start Quiz" />
  <meta property="fc:frame:button:2" content="View Leaderboard" />
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/frame/action" />
  <meta property="og:title" content="LearnFrame Quiz" />
  <meta property="og:image" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/og" />
</head>
<body>
  <h1>LearnFrame - Learn & Earn on Base</h1>
</body>
</html>
  `;
  
  return new NextResponse(frameHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { untrustedData } = body;
  const buttonIndex = untrustedData?.buttonIndex;
  
  let responseFrame = '';
  
  if (buttonIndex === 1) {
    // Quiz başlat
    responseFrame = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/og?quiz=1" />
  <meta property="fc:frame:button:1" content="A) ETH" />
  <meta property="fc:frame:button:2" content="B) BASE" />
  <meta property="fc:frame:button:3" content="C) MATIC" />
  <meta property="fc:frame:button:4" content="D) BNB" />
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/frame/answer" />
</head>
<body>
  <h1>What is the native token of Base blockchain?</h1>
</body>
</html>
    `;
  } else {
    // Leaderboard göster
    responseFrame = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/og?leaderboard=true" />
  <meta property="fc:frame:button:1" content="Back to Quiz" />
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/frame" />
</head>
<body>
  <h1>Leaderboard</h1>
</body>
</html>
    `;
  }
  
  return new NextResponse(responseFrame, {
    headers: { 'Content-Type': 'text/html' },
  });
}
