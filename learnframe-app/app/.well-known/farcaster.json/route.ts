import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "frame": {
      "name": "LearnFrame",
      "version": "1",
      "iconUrl": "https://learnframe.vercel.app/icon.png",
      "homeUrl": "https://learnframe.vercel.app",
      "imageUrl": "https://learnframe.vercel.app/image.png",
      "buttonTitle": "Start Learning",
      "splashImageUrl": "https://learnframe.vercel.app/splash.png",
      "splashBackgroundColor": "#1e293b",
      "webhookUrl": "https://learnframe.vercel.app/api/webhook",
      "subtitle": "Learn & Earn on Base",
      "description": "Educational quiz platform on Base blockchain. Complete quizzes, earn LEARN tokens, and collect achievement NFTs.",
      "primaryCategory": "education",
      "screenshotUrls": [
        "https://learnframe.vercel.app/api/preview"
      ],
      "tags": [
        "blockchain"
      ],
      "tagline": "blockchain, earn rewards",
      "ogTitle": "Learn to Earn Platform",
      "ogDescription": "Complete blockchain quizzes and earn LEARN tokens on Base",
      "ogImageUrl": "https://learnframe.vercel.app/api/preview"
    },
    "accountAssociation": {
      "header": "eyJmaWQiOjIwODY0NiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweGYwZTBlNTQwMjgyOUMyNzI3ZDhiNWEzZGY5MmI0NEQzRDM1N0VlQTcifQ",
      "payload": "eyJkb21haW4iOiJodHRwczovL2xlYXJuZnJhbWUudmVyY2VsLmFwcCJ9",
      "signature": "+PnHQuhlq61HAPXqqNh5qbiBtDtyMsnRA//T5cr3kpwoRgXZX9dPXz/HW5syDS7MljXcnpYtVlVLensPpKkQARs="
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
