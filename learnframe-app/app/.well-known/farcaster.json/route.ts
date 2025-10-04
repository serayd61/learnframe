import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    "accountAssociation": {
      "header": "YENİ_HEADER_DEĞERİ",
      "payload": "YENİ_PAYLOAD_DEĞERİ", 
      "signature": "YENİ_SIGNATURE_DEĞERİ"
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
