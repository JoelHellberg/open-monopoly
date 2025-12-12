type Props = {
  streetsPerSide: number;
};

export default function PlayersDisplay(props: Props) {
  return (
    <>
      <Player />
    </>
  );
}

function Player() {
  const playerPos = 0; // For testing, remove later

  return (
    <div
      className="absolute bg-red-500 rounded-full z-30"
      style={{
        width: "2%",
        height: "2%",
        top: "2%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    ></div>
  );
}

function getPlayerPositionX(streetNumber: number, streetsPerSide: number): number {

  return 0.5;
}

function getPlayerPositionY(streetNumber: number, streetsPerSide: number): number {
  return 0;
}