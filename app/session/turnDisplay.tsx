export default function TurnDisplay() {
  return (
    <div className="flex flex-col flex-1 bg-green-400 rounded-lg">
      <Player />
    </div>
  );
}

function Player() {
  return (
    <div className="flex w-full bg-yellow-400 opacity-50 items-center">
      <div className="h-4 aspect-square bg-red-400 rounded-full" />
      <p>Username</p>
    </div>
  );
}
