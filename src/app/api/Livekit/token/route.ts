import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { roomName, participantName } = await req.json().catch(() => ({}));

  if (!roomName || !participantName) {
    return NextResponse.json(
      { error: "roomName و participantName مطلوب" },
      { status: 400 }
    );
  }

  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Daily.co API key missing" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
      }),
    });

    if (!res.ok) {
      // الغرفة قد تكون موجودة بالفعل
      if (res.status === 409) {
        return NextResponse.json({
          token: "daily-token-placeholder",
          url: `https://daily.co/${roomName}`,
        });
      }
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      token: "daily-token-placeholder",
      url: data.url,
      roomName: roomName,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "تعذر إنشاء الغرفة" },
      { status: 500 }
    );
  }
}