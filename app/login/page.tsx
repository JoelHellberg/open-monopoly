"use client"
import { signInWithGoogle } from "./functions";

export default function Home() {
  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col justify-center items-center h-screen w-screen gap-5">
        <button
          className="outline p-2 rounded-2xl cursor-pointer hover:bg-gray-100"
          onClick={signInWithGoogle}
        >
          login with google
        </button>
        <a href="/signup" className="text-blue-400 hover:underline">
          Signup
        </a>
      </main>
    </div>
  );
}
