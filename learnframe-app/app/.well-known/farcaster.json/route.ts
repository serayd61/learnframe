import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjIwODY0NiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweGYwZTBlNTQwMjgyOUMyNzI3ZDhiNWEzZGY5MmI0NEQzRDM1N0VlQTcifQ",
      "payload": "eyJkb21haW4iOiJodHRwczovL2xlYXJuZnJhbWUudmVyY2VsLmFwcCJ9",
      "signature": "+PnHQuhlq61HAPXqqNh5qbiBtDtyMsnRA//T5cr3kpwoRgXZX9dPXz/HW5syDS7MljXcnpYtVlVLensPpKkQARs="
    },
    "frame": {
      "version": "1",
      "name": "LearnFrame",
      "iconUrl": "https://learnframe.vercel.app/icon.png",
      "homeUrl": "https://learnframe.vercel.app",
      "imageUrl": "https://learnframe.vercel.app/image.png",
      "buttonTitle": "Start Learning",
      "splashImageUrl": "https://learnframe.vercel.app/splash.png",
      "splashBackgroundColor": "#1e293b"
    }
  });
}
