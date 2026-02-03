export default function GameMessage({ messageContent, sender }: { messageContent: string, sender: string }) {
  return (
    <div className="flex flex-col w-full h-fit rounded-lg p-4 bg-orange-400">
      {sender}: {messageContent}
    </div>
  );
}
