import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const frameHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="https://learnframe.vercel.app/api/preview" />
  <meta property="fc:frame:button:1" content="Open App" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="https://learnframe.vercel.app" />
  <meta property="of:version" content="vNext" />
  <meta property="of:image" content="https://learnframe.vercel.app/api/preview" />
  <meta property="og:image" content="https://learnframe.vercel.app/api/preview" />
</head>
<body>
  <h1>LearnFrame - Learn & Earn on Base</h1>
</body>
</html>
  `;
  
  return new NextResponse(frameHtml, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'max-age=0',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Frame interaction:', body);
    
    return NextResponse.json({
      version: "vNext",
      image: "https://learnframe.vercel.app/api/preview",
      buttons: [
        {
          title: "Play Quiz",
          action: "link",
          target: "https://learnframe.vercel.app/quiz"
        }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
