export default function PropertiesDisplay() {
  return (
    <div className="flex flex-col flex-1 bg-orange-400 rounded-lg text-center">
      <h2>Properties</h2>
      <Property />
    </div>
  );
}

function Property() {
  return (
    <div className="flex h-5 w-full bg-amber-800 opacity-50">
      <div className="h-full aspect-9/16 bg-blue-400" />
      <p>Street name</p>
    </div>
  );
}
