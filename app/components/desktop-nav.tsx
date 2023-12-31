import type { Role } from "@prisma/client";
import { Form, Link, NavLink, useNavigation } from "@remix-run/react";
import { IconLoader, IconMailbox, IconRocket, IconUsers } from "@tabler/icons-react";
import type { ComponentPropsWithoutRef } from "react";
import { useSpinDelay } from "spin-delay";
import { ThemeModeToggle } from "~/components/theme-mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useUser } from "~/utils";

export const links: ReadonlyArray<{
  name: string;
  href: string;
  access: ReadonlyArray<Role>;
  icon: JSX.Element;
}> = [
  {
    name: "Leads",
    href: "/leads",
    access: ["SUPER_ADMIN", "CLIENT_USER", "CLIENT_ADMIN"],
    icon: <IconMailbox className="h-5 w-5" />,
  },
  { name: "Clients", href: "/clients", access: ["SUPER_ADMIN"], icon: <IconRocket className="h-5 w-5" /> },
  { name: "Users", href: "/users", access: ["SUPER_ADMIN"], icon: <IconUsers className="h-5 w-5" /> },
] as const;

export function DesktopNav(props: ComponentPropsWithoutRef<"nav">) {
  const user = useUser();
  const navigation = useNavigation();
  const showSpinner = useSpinDelay(navigation.state !== "idle");

  return (
    <nav className={cn("hidden h-full shrink-0 grow-0 basis-64 flex-col space-x-2 border-r border-border bg-background px-3 py-10 sm:flex", props.className)}>
      <div className="pl-3">
        <Link to="/leads" className="inline-flex items-center space-x-2">
          <Avatar className="h-14 w-14">
            <AvatarImage src="/space.svg" alt="Cosmic Logo" />
            <AvatarFallback className="text-2xl font-bold">CL</AvatarFallback>
          </Avatar>
          <IconLoader className={cn(showSpinner ? "animate-spin opacity-100" : "opacity-0", "ml-2 text-muted-foreground transition-opacity")} />
        </Link>
      </div>
      <ul className="mt-12 space-x-0 space-y-1">
        {links
          .filter((link) => user?.role && link.access.includes(user.role))
          .map((link) => {
            return (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) => cn("flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary", isActive && "bg-secondary text-primary")}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              </li>
            );
          })}
      </ul>
      <div className="mt-auto space-y-4">
        <Link to={`/users/${user.id}`} className="flex gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/paulhmorris.png" alt="@paulhmorris" />
            <AvatarFallback>
              {user.firstName.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-secondary-foreground">
              {user.firstName}
              {user.lastName && ` ${user.lastName}`}
            </div>
            <div className="max-w-[150px] truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </Link>
        <div className="flex gap-2">
          <Form method="post" action="/logout">
            <Button type="submit" variant="outline" className="sm:h-9">
              Log out
            </Button>
          </Form>
          <ThemeModeToggle />
        </div>
      </div>
    </nav>
  );
}
