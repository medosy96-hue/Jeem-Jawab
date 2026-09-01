"use client";

export function PushToTalkButton({
  roomName,
  playerName,
  playerId,
}: {
  roomName: string;
  playerName: string;
  playerId: string;
}) {
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  return (
    <button
      onClick={() => window.open(jitsiUrl, "_blank")}
      className="rounded-full bg-emerald-500 px-6 py-3 font-black text-white transition hover:bg-emerald-400"
    >
      📹 افتح غرفة الصوت والفيديو
    </button>
  );
}
