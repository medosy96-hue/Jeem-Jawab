"use client";

import { useEffect, useState } from "react";
import { useRoomContext } from "@daily-co/daily-react";

interface PushToTalkButtonProps {
  roomName: string;
  playerName: string;
  playerId: string;
}

export function PushToTalkButton({
  roomName,
  playerName,
  playerId,
}: PushToTalkButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  useEffect(() => {
    const createRoom = async () => {
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
          setError(data.error ?? "تعذر إنشاء الغرفة");
          return;
        }

        setMeetingUrl(data.url);
      } catch (err) {
        setError("خطأ في الاتصال");
      } finally {
        setIsLoading(false);
      }
    };

    createRoom();
  }, [roomName, playerName]);

  if (error) {
    return (
      <div className="rounded-full bg-red-500/20 px-6 py-3 text-center text-xs font-black text-red-300">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-full bg-white/10 px-6 py-3 text-center text-xs font-black text-white/70">
        جاري التحضير...
      </div>
    );
  }

  if (!meetingUrl) {
    return null;
  }

  return (
    
      href={meetingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-emerald-500 px-6 py-3 font-black text-white transition hover:bg-emerald-400"
    >
      🎤 افتح الدردشة الصوتية
    </a>
  );
}