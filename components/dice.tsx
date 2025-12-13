type Props = { numberOfSides?: number };

export default function Dice({ numberOfSides = 6 }: Props) {
  return (
    <div className="w-16 h-16 bg-white rounded-md shadow-md grid grid-cols-3 grid-rows-3">
      {Array.from({ length: 9 }).map((_, i) =>
        DICE_PATTERNS[numberOfSides]?.includes(i) ? (
          <div key={i} className="w-2/3 h-2/3 bg-black rounded-full m-auto" />
        ) : (
          <div key={i} />
        )
      )}
    </div>
  );
}

const DICE_PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
