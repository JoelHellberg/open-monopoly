import GameMessage from "./gameMessage";

export default function GameChat() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full h-8 bg-black text-white flex items-center justify-center rounded-t-lg">
        Chat
      </div>
      <div className="flex flex-col flex-1 rounded-b-lg overflow-y-auto gap-2 p-2 bg-blue-900">
        <GameMessage />
      </div>
    </div>
  );
}
