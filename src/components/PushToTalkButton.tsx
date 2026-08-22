"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, useLocalParticipant } from "@livekit/components-react";

interface PushToTalkButtonProps {
  roomName: string;
  playerName: string;
  playerId: string;
}

function VoiceButton() {
  const [isHolding, setIsHolding] = useState(false);
  const { localParticipant } = useLocalParticipant();

  const handleMouseDown = async () => {
    setIsHolding(true);
    if (localParticipant?.audioTrackPublications.length === 0) {
      await localParticipant?.setMicrophoneEnabled(true);
    }
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    localParticipant?.setMicrophoneEnabled(false);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`rounded-full px-6 py-3 font-black text-white transition ${
        isHolding
          ? "bg-red-500 scale-110 shadow-lg shadow-red-500"
          : "bg-emerald-500 hover:bg-emerald-400"
      }`}
    >
      {isHolding ? "🎤 جاري التحدث..." : "🎤 اضغط لتتحدث"}
    </button>
  );
}

export function PushToTalkButton({
  roomName,
  playerName,
  playerId,
}: PushToTalkButtonProps) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            participantName: playerName,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "تعذر الاتصال بالدردشة الصوتية");
          return;
        }
        setToken(data.token);
      } catch (err) {
        setError("خطأ في الاتصال");
      }
    };

    getToken();
  }, [roomName, playerName]);

  if (error) {
    return (
      <div className="rounded-full bg-red-500/20 px-6 py-3 text-center text-xs font-black text-red-300">
        {error}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-full bg-white/10 px-6 py-3 text-center text-xs font-black text-white/70">
        جاري التحضير...
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connectOptions={{ autoSubscribe: true }}
      onError={(err) => {
        console.error("LiveKit Error:", err);
        setError("خطأ في الاتصال الصوتي");
      }}
    >
      <VoiceButton />
    </LiveKitRoom>
  );
}