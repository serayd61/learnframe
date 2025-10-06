export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjIwODY0NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM1NjhlQTVjY0M2OEVkMDE5NDNFODQ3YWVDMTY2MTY3NTA2NDhENjUifQ",
      payload: "eyJkb21haW4iOiJsZWFybmZyYW1lLnZlcmNlbC5hcHAifQ",
      signature: "MHgxNDgxMTU1M2YxYzQyODk1NDlkNmY5MDNjNzhmYTFiODZhYjhjNmIyZDBlNjMyNWI2YzIwNzZhZTRkYjJlYjE5NmUyYWMzNTc1MTEyNTUyMjhmMDg0YTJkMWRiMzk1NmMyZTgzYmRkMzdlMmM1YmU4NDMyNGNiMTkyY2YzZDg2YjFi"
    },
    frame: {
      version: "1",
      name: "LearnFrame",
      iconUrl: "https://learnframe.vercel.app/api/preview",
      homeUrl: "https://learnframe.vercel.app",
      imageUrl: "https://learnframe.vercel.app/api/preview",
      buttonTitle: "Start Learning",
      splashImageUrl: "https://learnframe.vercel.app/api/preview",
      splashBackgroundColor: "#1e293b"
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
