import { Customer } from "@/data/customers";
import { LoanApplication } from "@/types/chat";
import { FileText, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SanctionLetterProps {
  customer: Customer;
  loan: LoanApplication;
}

export const SanctionLetter = ({ customer, loan }: SanctionLetterProps) => {
  const today = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    const content = `
TATA CAPITAL FINANCIAL SERVICES LIMITED
Sanction Letter

Date: ${today}
Reference No: TC/PL/${Date.now()}

Dear ${customer.name},

We are pleased to inform you that your Personal Loan application has been approved.

LOAN DETAILS:
- Loan Amount: ₹${loan.requestedAmount.toLocaleString()}
- Interest Rate: ${loan.interestRate}% per annum
- Tenure: ${loan.tenure} months
- EMI: ₹${loan.emi.toLocaleString()}/month

Please visit our nearest branch with the original documents for loan disbursement.

Thank you for choosing Tata Capital.

Best Regards,
Tata Capital Financial Services Ltd.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sanction_Letter_${customer.name.replace(' ', '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="font-semibold">Loan Sanction Letter</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Success Banner */}
        <div className="flex items-center gap-3 bg-success/10 text-success p-4 rounded-lg">
          <CheckCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Congratulations!</p>
            <p className="text-sm opacity-80">Your loan has been approved</p>
          </div>
        </div>

        {/* Letterhead */}
        <div className="text-center border-b border-border pb-4">
          <h2 className="text-xl font-bold text-primary">TATA CAPITAL</h2>
          <p className="text-xs text-muted-foreground">Financial Services Limited</p>
        </div>

        {/* Date & Reference */}
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Reference No.</p>
            <p className="font-medium font-mono text-xs">TC/PL/{Date.now().toString().slice(-8)}</p>
          </div>
        </div>

        {/* Recipient */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-muted-foreground text-sm">To,</p>
          <p className="font-semibold">{customer.name}</p>
          <p className="text-sm text-muted-foreground">{customer.city}</p>
        </div>

        {/* Loan Details Table */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Loan Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs">Loan Amount</p>
              <p className="font-bold text-lg text-primary">₹{loan.requestedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs">Monthly EMI</p>
              <p className="font-bold text-lg text-primary">₹{loan.emi.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs">Interest Rate</p>
              <p className="font-semibold">{loan.interestRate}% p.a.</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-muted-foreground text-xs">Tenure</p>
              <p className="font-semibold">{loan.tenure} months</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-xs text-muted-foreground space-y-2 border-t border-border pt-4">
          <p>This sanction is subject to the following terms:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Submission of original documents for verification</li>
            <li>Successful completion of all KYC requirements</li>
            <li>This offer is valid for 30 days from the date of issue</li>
          </ul>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Sanction Letter
        </Button>
      </div>
    </div>
  );
};
