import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjIwODY0NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM1NjhlQTVjY0M2OEVkMDE5NDNFODQ3YWVDMTY2MTY3NTA2NDhENjUifQ",
      "payload": "eyJkb21haW4iOiJsZWFybmZyYW1lLnZlcmNlbC5hcHAifQ",
      "signature": "MHgxNDgxMTU1M2YxYzQyODk1NDlkNmY5MDNjNzhmYTFiODZhYjhjNmIyZDBlNjMyNWI2YzIwNzZhZTRkYjJlYjE5NmUyYWMzNTc1MTEyNTUyMjhmMDg0YTJkMWRiMzk1NmMyZTgzYmRkMzdlMmM1YmU4NDMyNGNiMTkyY2YzZDg2YjFi"
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
