export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    frame: {
      name: "LearnFrame",
      version: "1",
      iconUrl: "https://learnframe.vercel.app/icon.png",
      homeUrl: "https://learnframe.vercel.app",
      imageUrl: "https://learnframe.vercel.app/api/preview",
      buttonTitle: "Start Learning 🎓",
      splashImageUrl: "https://learnframe.vercel.app/icon.png",
      splashBackgroundColor: "#1e293b",
      webhookUrl: "https://learnframe.vercel.app/api/webhook",
      subtitle: "Learn Blockchain, Earn Tokens",
      description: "Master blockchain knowledge and earn LEARN tokens on Base. Interactive quizzes with advanced scoring, real rewards, and global leaderboards. Learn about Web3, DeFi, smart contracts, and more while earning on-chain rewards.",
      primaryCategory: "education",
      heroImageUrl: "https://learnframe.vercel.app/api/preview",
      screenshotUrls: [
        "https://learnframe.vercel.app/api/preview"
      ],
      tags: [
        "blockchain",
        "education",
        "base",
        "web3",
        "quiz"
      ],
      tagline: "Learn Blockchain, Earn Real Tokens on Base",
      ogTitle: "LearnFrame - Learn & Earn on Base",
      ogImageUrl: "https://learnframe.vercel.app/api/preview",
      ogDescription: "Master blockchain knowledge and earn LEARN tokens through interactive quizzes. Join thousands learning Web3 on Base.",
      castShareUrl: "https://learnframe.vercel.app"
    },
    accountAssociation: {
      header: "eyJmaWQiOjIwODY0NiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweGYwZTBlNTQwMjgyOUMyNzI3ZDhiNWEzZGY5MmI0NEQzRDM1N0VlQTcifQ",
      payload: "eyJkb21haW4iOiJodHRwczovL2xlYXJuZnJhbWUudmVyY2VsLmFwcC8ifQ",
      signature: "cGVq3rBzVNLdoH7uXQlJ8xIjvm1hFUsZkehL3T4fwVwxu26lOpv9ojQv2b/6Om+W22KwO0f+AiGbQzvDeaYgehs="
    },
    miniApp: {
      name: "LearnFrame",
      description: "Master blockchain knowledge and earn LEARN tokens on Base. Interactive quizzes with advanced scoring, real rewards, and global leaderboards. Learn about Web3, DeFi, smart contracts, and more while earning on-chain rewards.",
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
