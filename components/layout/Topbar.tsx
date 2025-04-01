import Link from "next/link";
import SidebarSheet from "./SidebarSheet";

const Topbar = () => {
  return (
    // <div className="p-3 border-b text-">
    //   <Link href="/" className="text-xl font-bold text">MockA</Link>
    // </div>
    <div className="w-full md:w-[calc(100vw-var(--sidebar-width))] fixed top-0 z-50 h-[--topbar-height] border-b bg-card flex px-6 items-center gap-3">
      <SidebarSheet />
      <div className="flex items-center gap-3">
        <span className="hidden sm:block">API endpoint:</span>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/api/mock`}
          className="text-primary text-ellipsis overflow-hidden whitespace-nowrap max-w-48 xs:max-w-full"
          target="_blank"
        >
          {`${process.env.NEXT_PUBLIC_APP_URL}/api/mock/:endpoint`}
        </Link>
      </div>
    </div>
  );
};

export default Topbar;
