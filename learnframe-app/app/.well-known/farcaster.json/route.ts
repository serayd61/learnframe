export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjIwODY0NiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM1NjhlQTVjY0M2OEVkMDE5NDNFODQ3YWVDMTY2MTY3NTA2NDhENjUifQ",
      payload: "eyJkb21haW4iOiJsZWFybmZyYW1lLnZlcmNlbC5hcHAifQ",
      signature: "MHgxNDgxMTU1M2YxYzQyODk1NDlkNmY5MDNjNzhmYTFiODZhYjhjNmIyZDBlNjMyNWI2YzIwNzZhZTRkYjJlYjE5NmUyYWMzNTc1MTEyNTUyMjhmMDg0YTJkMWRiMzk1NmMyZTgzYmRkMzdlMmM1YmU4NDMyNGNiMTkyY2YzZDg2YjFi"
    },
    miniApp: {
      name: "LearnFrame",
      description: "Learn blockchain knowledge, earn LEARN tokens on Base with advanced quiz system",
      icon: "https://learnframe.vercel.app/icon.png",
      iconUrl: "https://learnframe.vercel.app/icon.png",
      url: "https://learnframe.vercel.app",
      homeUrl: "https://learnframe.vercel.app",
      splashImageUrl: "https://learnframe.vercel.app/icon.png",
      splashBackgroundColor: "#1e293b",
      primaryCategory: "education",
      tags: ["blockchain", "education", "base", "web3", "quiz"],
      version: "1.2.0",
      developer: {
        name: "LearnFrame Team",
        url: "https://learnframe.vercel.app"
      },
      permissions: [
        "wallet.connect",
        "wallet.send",
        "notifications.push"
      ],
      supportedChains: ["base"],
      minSdkVersion: "0.1.0"
    },
    baseBuilder: {
      allowedAddresses: ["0x5c0834E86c197b10d583940EC6366EFaA2e93B1e"]
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}
