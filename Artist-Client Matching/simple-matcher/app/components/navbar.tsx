import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-900 text-white flex gap-10 sticky flex-row">
      <div className="flex flex-row space-x-8">
        <Link href="/" className=" hover:text-[#73d9ed]">Home</Link>
        <Link href="/pages/client/request" className="hover:text-[#73d9ed]">Requests</Link>
      </div>
      
      <div className="flex flex-row space-x-8">
        <Link href="/pages/sign-in" className="hover:text-[#73d9ed]">Log in</Link>
        <Link href="/pages/sign-up" className="hover:text-[#73d9ed]">Sign up</Link>
      </div>
    </nav>
  );
}
