"use client";

import { 
  MoreHorizontal, 
  MessageCircle, 
  Mail, 
  Phone, 
  Calendar,
  IndianRupee
} from "lucide-react";

type Lead = {
  id: string;
  name: string;
  source: string;
  package: string;
  date: string;
  value?: number;
};

const MOCK_DATA: Record<string, Lead[]> = {
  "new-lead": [
    { id: "L-101", name: "Rahul Sharma", source: "Landing Page: Andaman", package: "Premium Andaman Escape", date: "2m ago" },
    { id: "L-102", name: "Priya Patel", source: "Organic Search", package: "Maldives Honeymoon", date: "1h ago" },
  ],
  "quote-sent": [
    { id: "L-098", name: "Amit Kumar", source: "Facebook Ad", package: "Dubai Shopping Fest", date: "Yesterday", value: 85000 },
    { id: "L-095", name: "Sneha Desai", source: "Landing Page: Andaman", package: "Andaman Family Trip", date: "2 days ago", value: 120000 },
  ],
  "follow-up": [
    { id: "L-082", name: "Vikram Singh", source: "Referral", package: "Bali Retreat", date: "3 days ago", value: 95000 },
  ],
  "converted": [
    { id: "L-071", name: "Neha Gupta", source: "Landing Page: Andaman", package: "Premium Andaman Escape", date: "5 days ago", value: 110000 },
  ]
};

const COLUMNS = [
  { id: "new-lead", title: "New Leads", color: "bg-blue-500" },
  { id: "quote-sent", title: "Quote Sent", color: "bg-amber-500" },
  { id: "follow-up", title: "Follow Up", color: "bg-purple-500" },
  { id: "converted", title: "Converted (Booking)", color: "bg-emerald-500" },
];

export function CrmBoard() {
  return (
    <div className="flex h-full gap-6 pb-4 min-w-max">
      {COLUMNS.map((col) => (
        <div key={col.id} className="w-80 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <h3 className="font-semibold text-sm tracking-tight">{col.title}</h3>
              <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {MOCK_DATA[col.id].length}
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 space-y-3">
            {MOCK_DATA[col.id].map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground">{lead.id}</span>
          <h4 className="font-semibold text-sm text-foreground mt-0.5">{lead.name}</h4>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="truncate">{lead.source}</span>
        </div>
        <div className="text-xs font-medium text-primary flex items-center gap-1.5 bg-primary/5 rounded px-2 py-1 w-fit">
          <span className="truncate">{lead.package}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" /> {lead.date}
        </div>
        {lead.value ? (
          <div className="text-xs font-bold flex items-center">
            <IndianRupee className="h-3 w-3" /> {lead.value.toLocaleString()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
              <Phone className="h-3 w-3" />
            </button>
            <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
              <Mail className="h-3 w-3" />
            </button>
            <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
              <MessageCircle className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
