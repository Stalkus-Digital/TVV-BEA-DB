import Link from "next/link";
import {
  LayoutDashboard,
  PackageSearch,
  Users,
  Contact,
  Megaphone,
  Wand2,
  Settings,
  Ship,
  Plane,
  Hotel,
  Compass,
  MapPin,
  Layers,
  Receipt,
  Luggage,
  Calendar,
  Inbox,
  BookOpen,
  Globe,
  Boxes,
  HelpCircle,
  Image as ImageIcon,
  Link2,
  Layout,
} from "lucide-react";

const navGroups = [
  {
    title: "Overview",
    links: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "CRM", href: "/crm", icon: Users },
      { name: "Customers", href: "/customers", icon: Contact },
    ]
  },
  {
    title: "Itinerary Management",
    links: [
      { name: "Ferry Rate Charges", href: "/itinerary/ferry-rates", icon: Ship },
      { name: "Flight Management", href: "/itinerary/flights", icon: Plane },
      { name: "Holiday Packages", href: "/packages", icon: PackageSearch },
      { name: "Inventory", href: "/inventory", icon: Boxes },
      { name: "Hotels", href: "/itinerary/hotels", icon: Hotel },
      { name: "Activities", href: "/itinerary/activities", icon: Compass },
      { name: "Destinations", href: "/destinations", icon: MapPin },
      { name: "AI Package builder", href: "/ai-studio", icon: Wand2 },
    ]
  },
  {
    title: "Bookings Management",
    links: [
      { name: "Hotel Bookings", href: "/bookings/hotels", icon: Receipt },
      { name: "Holiday Bookings", href: "/bookings/holidays", icon: Luggage },
      { name: "Activity Bookings", href: "/bookings/activities", icon: Calendar },
    ]
  },
  // {
  //   title: "Operations",
  //   links: [
  //     { name: "Operations Center", href: "/operations", icon: Activity },
  //     { name: "System Health", href: "/operations/health", icon: Settings },
  //     { name: "Observability", href: "/operations/observability", icon: Radar },
  //     { name: "Storage", href: "/operations/storage", icon: HardDrive },
  //     { name: "Supplier Runtime", href: "/operations/supplier-runtime", icon: Server },
  //     { name: "System Logs", href: "/operations/logs", icon: FileText },
  //     { name: "Alerts", href: "/operations/alerts", icon: Bell },
  //   ]
  // },

  // {
  //   title: "Marketing",
  //   links: [
  //     { name: "Marketing Dashboard", href: "/marketing", icon: BarChart3 },
  //     { name: "Campaigns", href: "/marketing/campaigns", icon: Megaphone },
  //     { name: "Forms", href: "/marketing/forms", icon: FileText },
  //     { name: "SEO Dashboard", href: "/marketing/seo", icon: Globe },
  //     { name: "Content Performance", href: "/marketing/content", icon: TrendingUp },
  //   ]
  // },
  {
    title: "CMS",
    links: [
      { name: "Content Dashboard", href: "/cms", icon: LayoutDashboard },
      { name: "Home Sections", href: "/cms/home", icon: Megaphone },
      { name: "Landing Pages", href: "/cms/landing-pages", icon: Layers },
      { name: "SEO Pages", href: "/cms/seo", icon: Globe },
      { name: "FAQ Management", href: "/cms/faqs", icon: HelpCircle },
      { name: "Media Browser", href: "/cms/media", icon: ImageIcon },
      { name: "Navigation", href: "/cms/navigation", icon: Link2 },
      { name: "Footer Content", href: "/cms/footer", icon: Layout },
      { name: "Enquiries", href: "/cms/enquiries", icon: Inbox },
      { name: "Guides (Blogs)", href: "/cms/guides", icon: BookOpen },
    ]
  }
];

export function Sidebar() {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="font-bold text-lg tracking-tight">
          <span className="text-primary">The</span> Vacation Voice
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, i) => (
          <div key={i}>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.links.map((link, j) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={j}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <Link
          href="/operations"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" />
          Operations
        </Link>
      </div>
    </div>
  );
}
