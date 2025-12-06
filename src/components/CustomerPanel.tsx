import { Customer } from "@/data/customers";
import { User, MapPin, Briefcase, CreditCard, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerPanelProps {
  customer: Customer | null;
}

export const CustomerPanel = ({ customer }: CustomerPanelProps) => {
  if (!customer) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Customer details will appear here once identified</p>
        </div>
      </div>
    );
  }

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return "text-success";
    if (score >= 650) return "text-warning";
    return "text-destructive";
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 800) return "Excellent";
    if (score >= 750) return "Very Good";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    return "Poor";
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{customer.name}</h3>
            <p className="text-sm opacity-80">{customer.id}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Location & Age */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{customer.city}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{customer.age} years</span>
        </div>

        {/* Employment */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-1">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>Employment</span>
          </div>
          <p className="text-sm text-muted-foreground">{customer.occupation}</p>
          <p className="text-sm font-medium">{customer.employerName}</p>
        </div>

        {/* Income */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
          <p className="text-lg font-bold text-primary">₹{customer.monthlyIncome.toLocaleString()}</p>
        </div>

        {/* Credit Score */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Credit Score</span>
            </div>
            <span className={cn("text-xs font-medium", getCreditScoreColor(customer.creditScore))}>
              {getCreditScoreLabel(customer.creditScore)}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className={cn("text-2xl font-bold", getCreditScoreColor(customer.creditScore))}>
              {customer.creditScore}
            </span>
            <span className="text-sm text-muted-foreground mb-1">/ 900</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                customer.creditScore >= 750 && "bg-success",
                customer.creditScore >= 650 && customer.creditScore < 750 && "bg-warning",
                customer.creditScore < 650 && "bg-destructive"
              )}
              style={{ width: `${(customer.creditScore / 900) * 100}%` }}
            />
          </div>
        </div>

        {/* Pre-approved Limit */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
            <CreditCard className="h-4 w-4" />
            <span>Pre-Approved Limit</span>
          </div>
          <p className="text-xl font-bold text-primary">₹{customer.preApprovedLimit.toLocaleString()}</p>
        </div>

        {/* Existing Loans */}
        {customer.currentLoans.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Existing Loans
            </p>
            <div className="space-y-2">
              {customer.currentLoans.map((loan, index) => (
                <div key={index} className="flex justify-between text-sm bg-secondary/30 rounded-lg p-2">
                  <span className="text-muted-foreground">{loan.type}</span>
                  <span className="font-medium">₹{loan.emi.toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
