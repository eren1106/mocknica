'use client'

import { ModeToggle } from "@/components/mode-toggle";
import { NAV_ITEMS } from "@/constants/nav-items";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onNavItemClicked?: () => void;
}

const Sidebar = (props: SidebarProps) => {
  const pathname = usePathname();

  const checkIsSelected = (to: string): boolean => {
    const normalizePath = (path: string): string => path.replace(/\/+$/, ""); // Remove trailing slashes

    const currentPath = normalizePath(pathname);
    const rootPath = normalizePath("/");

    if (to === "") {
      return currentPath === rootPath;
    }

    // Check if the current path matches the tab's path or starts with the tab's path
    const pathPrefix = normalizePath(`/${to}`);
    return currentPath.startsWith(pathPrefix);
  }

  return (
    <div className="flex flex-col px-3 py-6">
      <div className="flex justify-between mt-3 mb-5 items-center flex-wrap gap-3">
        <div className="flex gap-3 items-center">
          {/* <NextImage src={APP_LOGO} alt="app logo" className="size-12" /> */}
          <Link href="/">
            <h1>MockA</h1>
          </Link>
        </div>
        <div className="block md:hidden">
          <ModeToggle />
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {
          NAV_ITEMS.map((item) => {
            // to make selected tab have color
            const selectedClassname = checkIsSelected(item.to) ? "bg-secondary" : "";

            return (
              <Link href={`/${item.to}`} className="w-full" key={item.to} onClick={props.onNavItemClicked}>
                <div className={cn("flex items-center justify-start gap-3 p-3 w-full rounded-lg hover:bg-secondary", selectedClassname)}>
                  {/*
                  // @ts-ignore */}
                  {item.icon && <item.icon className="size-5" />}
                  <p>{item.label}</p>
                </div>
              </Link>
            )
          })
        }
      </nav>
    </div>
  )
}

export default Sidebar