import GameMessage from "./gameMessage";

export default function GameChat() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full p-6 h-8 bg-black text-white flex items-center justify-center rounded-t-lg">
        Chat
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto gap-2 p-2 bg-blue-900">
        <GameMessage />
      </div>

      <div className="w-full p-6 h-8 bg-black text-white flex items-center justify-center rounded-b-lg">
        <input placeholder="Write message here.." className="outline-none w-full"/>
      </div>
    </div>
  );
}
