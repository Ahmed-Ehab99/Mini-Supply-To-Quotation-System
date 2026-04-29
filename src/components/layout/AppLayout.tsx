import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  PlusCircle,
  Tag,
  Truck,
  Users,
  Users2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/catalog", label: "Materials", icon: Package },
      { to: "/suppliers", label: "Suppliers", icon: Users2 },
      { to: "/locations", label: "Locations", icon: MapPin },
      { to: "/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Supply",
    items: [
      { to: "/offers", label: "Supplier Offers", icon: Tag },
      { to: "/delivery-rates", label: "Delivery Rates", icon: Truck },
    ],
  },
  {
    label: "Quotations",
    items: [
      { to: "/quotations", label: "All Quotations", icon: FileText },
      { to: "/quotations/new", label: "New Quotation", icon: PlusCircle },
    ],
  },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">SupplyQ</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Quotation builder
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to ||
                      pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                        collapsed && "justify-center px-2",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="sticky top-0 hidden h-screen shrink-0 border-r border-border bg-card md:block"
      >
        <SidebarContent collapsed={!sidebarOpen} />
        <div className="absolute -right-3 top-20 hidden md:block">
          <button
            onClick={toggleSidebar}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent collapsed={false} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">SupplyQ</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
