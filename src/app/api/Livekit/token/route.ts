import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { roomName, participantName } = await req.json().catch(() => ({}));

  if (!roomName || !participantName) {
    return NextResponse.json(
      { error: "roomName و participantName مطلوب" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit مو منصب صح" },
      { status: 500 }
    );
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });
    
    at.addGrant({
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      room: roomName,
    });

    const token = await at.toJwt();
    
    return NextResponse.json({
      token: token,
    });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "تعذر إنشاء token الاتصال" },
      { status: 500 }
    );
  }
}