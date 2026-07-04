import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, packages, leads..."
            className="w-full bg-muted/50 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full ring-2 ring-card" />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
