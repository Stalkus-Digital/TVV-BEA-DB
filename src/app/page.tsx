import { CreditCard, Users, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { name: "Total Revenue", value: "₹45,231.89", change: "+20.1%", trend: "up", icon: CreditCard },
  { name: "Active Bookings", value: "+2350", change: "+180.1%", trend: "up", icon: Calendar },
  { name: "New Leads", value: "12,234", change: "+19%", trend: "up", icon: Users },
  { name: "Conversion Rate", value: "8.2%", change: "-2.4%", trend: "down", icon: ArrowUpRight },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to The Vacation Voice. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">{stat.name}</h3>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm col-span-4 p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue breakdown.</p>
          </div>
          <div className="h-[300px] w-full rounded-md bg-muted/20 border border-dashed border-border flex items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">Chart visualization area</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm col-span-3 p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest bookings and leads.</p>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserAvatar seed={i} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">User Name {i}</p>
                  <p className="text-xs text-muted-foreground">New booking • 2m ago</p>
                </div>
                <div className="font-medium text-sm">+₹2,499.00</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ seed }: { seed: number }) {
  return (
    <span className="text-xs font-medium text-primary">
      {['JD', 'AS', 'MR', 'KL', 'SJ'][seed - 1]}
    </span>
  );
}
