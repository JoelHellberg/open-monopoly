type Props = {
  streetsPerSide: number;
  streetsBetweenCorners: number;
};

export default function PlayerDisplay(props: Props) {
  const playerPos = 0; // For testing, remove later

  const playerRow = getPlayerRow(playerPos, props.streetsPerSide);
  const streetWidth = 100 / (props.streetsPerSide + 2);

  const cornerPieces = getCornerPieces(props.streetsPerSide);
  const x = getPlayerPositionX(playerPos, cornerPieces, streetWidth, playerRow);
  const y = getPlayerPositionY(playerPos, cornerPieces, streetWidth, playerRow);

  return (
    <div
      className="absolute bg-red-500 rounded-full z-30"
      style={{
        width: "2%",
        height: "2%",
        top: `${y}%`,
        left: `${x}%`,
        transform: "translate(-50%, -50%)",
      }}
    ></div>
  );
}

function getPlayerRow(streetNumber: number, streetsPerSide: number): string {
  const streetsBetweenCorners = streetsPerSide - 2;

  if (streetNumber < streetsPerSide) return "top";
  else if (streetNumber < streetsPerSide + streetsBetweenCorners)
    return "right";
  else if (streetNumber < streetsPerSide * 2 + streetsBetweenCorners)
    return "bottom";
  else return "left";
}

type CornerName = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
type CornerPieces = Record<CornerName, number>;

function getCornerPieces(streetsPerSide: number): CornerPieces {
  return {
    topLeft: 0,
    topRight: streetsPerSide - 1,
    bottomRight: streetsPerSide * 2 - 2,
    bottomLeft: streetsPerSide * 3 - 3,
  };
}

function getCornerForStreet(
  streetNumber: number,
  corners: CornerPieces
): CornerName | null {
  for (const [corner, index] of Object.entries(corners)) {
    if (index === streetNumber) {
      return corner as CornerName;
    }
  }
  return null;
}

function getPlayerPositionX(
  streetNumber: number,
  corners: CornerPieces,
  streetWidth: number,
  playerRow: string
): number {
  const xOffset = streetWidth * 2;
  const corner = getCornerForStreet(streetNumber, corners);

  if (corner) {
    console.log("Player is on corner:", corner);
    switch (corner) {
      case "topLeft":
        return streetWidth;
      case "topRight":
        return 100 - streetWidth;
      case "bottomRight":
        return 100 - streetWidth;
      case "bottomLeft":
        return streetWidth;
    }
  }

  switch (playerRow) {
    case "top":
      return streetNumber * streetWidth - streetWidth / 2 + xOffset;
    case "right":
      return 100 - streetWidth / 3;
    case "bottom":
      return (
        100 -
        (streetNumber - corners.bottomRight) * streetWidth +
        streetWidth / 2 -
        xOffset
      );
    case "left":
    default:
      return streetWidth / 3;
  }
}

function getPlayerPositionY(
  streetNumber: number,
  corners: CornerPieces,
  streetWidth: number,
  playerRow: string
): number {
  const yOffset = streetWidth * 2;

  let relativeStreetNumber = streetNumber;
  if (relativeStreetNumber > corners.bottomLeft)
    relativeStreetNumber -= corners.bottomLeft;
  else if (relativeStreetNumber > corners.topRight)
    relativeStreetNumber -= corners.topRight;

  switch (playerRow) {
    case "top":
      return streetWidth / 3;
    case "right":
      return relativeStreetNumber * streetWidth - streetWidth / 2 + yOffset;
    case "bottom":
      return 100 - streetWidth / 3;
    case "left":
    default:
      return (
        100 - relativeStreetNumber * streetWidth + streetWidth / 2 - yOffset
      );
  }
}
