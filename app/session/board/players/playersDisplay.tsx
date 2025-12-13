import PlayerDisplay from "./playerDisplay";

type Props = {
  streetsPerSide: number;
  streetsBetweenCorners: number;
};

export default function PlayersDisplay(props: Props) {
  return (
    <>
      <PlayerDisplay
        streetsPerSide={props.streetsPerSide}
        streetsBetweenCorners={props.streetsBetweenCorners}
      />
    </>
  );
}