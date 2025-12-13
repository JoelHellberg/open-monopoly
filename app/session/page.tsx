import ActionsDisplay from "./board/actionsDisplay";
import GameBoard from "./board/gameboard";
import GameChat from "./chat/gameChat";

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-screen w-screen gap-3 p-2 [&>div]:rounded-lg">
        <div className="bg-yellow-400 flex flex-1">
          <GameChat />
        </div>
        <div className="relative h-full aspect-square bg-pink-400">
          <ActionsDisplay />
          <GameBoard />
        </div>
        <div className="bg-blue-400 flex flex-1"></div>
      </main>
    </div>
  );
}
