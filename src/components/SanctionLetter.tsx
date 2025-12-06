import { Customer } from "@/data/customers";
import { LoanApplication } from "@/types/chat";
import { FileText, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

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
  
  const referenceNo = `TC/PL/${Date.now().toString().slice(-8)}`;
  const totalPayable = loan.emi * loan.tenure;
  const totalInterest = totalPayable - loan.requestedAmount;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, fontSize: number = 12, fontStyle: 'normal' | 'bold' = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // Header - Company Logo Area
    doc.setFillColor(0, 82, 147); // Tata Blue
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    addCenteredText('TATA CAPITAL', 18, 24, 'bold');
    addCenteredText('Financial Services Limited', 28, 10, 'normal');
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Sanction Letter Title
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - (2 * margin), 15, 'F');
    addCenteredText('PERSONAL LOAN SANCTION LETTER', yPos + 5, 14, 'bold');
    yPos += 25;

    // Reference and Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${today}`, margin, yPos);
    doc.text(`Reference No: ${referenceNo}`, pageWidth - margin - 60, yPos);
    yPos += 15;

    // Recipient
    doc.setFont('helvetica', 'bold');
    doc.text('To,', margin, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(customer.name, margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(customer.city, margin, yPos);
    doc.text(`Phone: ${customer.phone}`, margin, yPos + 5);
    doc.text(`Email: ${customer.email}`, margin, yPos + 10);
    yPos += 25;

    // Subject line
    doc.setFont('helvetica', 'bold');
    doc.text('Subject: Sanction of Personal Loan', margin, yPos);
    yPos += 15;

    // Dear Customer
    doc.setFont('helvetica', 'normal');
    doc.text(`Dear ${customer.name},`, margin, yPos);
    yPos += 10;

    // Body text
    const bodyText = `We are pleased to inform you that your application for a Personal Loan has been approved. Based on your credit profile, income details, and our internal assessment, we are sanctioning the loan as per the terms mentioned below.`;
    const bodyLines = doc.splitTextToSize(bodyText, pageWidth - (2 * margin));
    doc.text(bodyLines, margin, yPos);
    yPos += bodyLines.length * 5 + 15;

    // Loan Details Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(0, 82, 147);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos - 5, pageWidth - (2 * margin), 65, 3, 3, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 82, 147);
    doc.text('LOAN DETAILS', margin + 5, yPos + 5);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Two column layout for loan details
    const col1X = margin + 5;
    const col2X = pageWidth / 2 + 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Sanctioned Loan Amount:', col1X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${loan.requestedAmount.toLocaleString()}/-`, col1X + 50, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Rate of Interest:', col2X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${loan.interestRate}% p.a.`, col2X + 40, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Loan Tenure:', col1X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${loan.tenure} months`, col1X + 50, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly EMI:', col2X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${loan.emi.toLocaleString()}/-`, col2X + 40, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Total Interest Payable:', col1X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${totalInterest.toLocaleString()}/-`, col1X + 50, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Total Amount Payable:', col2X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${totalPayable.toLocaleString()}/-`, col2X + 40, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Loan Purpose:', col1X, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(loan.purpose.charAt(0).toUpperCase() + loan.purpose.slice(1), col1X + 50, yPos);
    
    yPos += 25;

    // Terms and Conditions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 82, 147);
    doc.text('TERMS AND CONDITIONS:', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const terms = [
      '1. This sanction letter is valid for 30 days from the date of issue.',
      '2. Loan disbursement is subject to submission and verification of original documents.',
      '3. The borrower shall set up e-NACH/Auto-debit for EMI payments.',
      '4. Pre-payment/Foreclosure is allowed as per RBI guidelines with applicable charges.',
      '5. In case of default, penal interest at 2% per month will be charged on overdue amount.',
      '6. The borrower agrees to all terms as per the loan agreement to be executed.',
      '7. Processing fee and other applicable charges will be deducted from disbursement amount.'
    ];
    
    terms.forEach(term => {
      const termLines = doc.splitTextToSize(term, pageWidth - (2 * margin));
      doc.text(termLines, margin, yPos);
      yPos += termLines.length * 4 + 3;
    });
    
    yPos += 10;

    // Next Steps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 82, 147);
    doc.text('NEXT STEPS:', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('1. Visit our nearest branch with original KYC documents', margin + 5, yPos);
    yPos += 5;
    doc.text('2. Complete e-NACH registration for EMI auto-debit', margin + 5, yPos);
    yPos += 5;
    doc.text('3. Sign the loan agreement and related documents', margin + 5, yPos);
    yPos += 5;
    doc.text('4. Receive loan amount in your registered bank account within 24-48 hours', margin + 5, yPos);
    
    yPos += 20;

    // Signature section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('For Tata Capital Financial Services Limited', margin, yPos);
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Authorized Signatory', margin, yPos);
    doc.text('(Digitally Signed)', margin, yPos + 5);

    // Footer
    doc.setFillColor(0, 82, 147);
    doc.rect(0, 280, pageWidth, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    addCenteredText('Tata Capital Financial Services Ltd. | CIN: U65990MH2010PLC210201', 286, 8);
    addCenteredText('Registered Office: 11th Floor, Tower A, Peninsula Business Park, Senapati Bapat Marg, Lower Parel, Mumbai - 400013', 292, 7);

    // Save the PDF
    doc.save(`Sanction_Letter_${customer.name.replace(/\s/g, '_')}_${referenceNo.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg animate-fade-in">
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
        <div className="flex items-center gap-3 bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-lg">
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
            <p className="font-medium font-mono text-xs">{referenceNo}</p>
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

        {/* Additional Details */}
        <div className="bg-primary/5 p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Interest Payable</span>
            <span className="font-medium">₹{totalInterest.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount Payable</span>
            <span className="font-bold text-primary">₹{totalPayable.toLocaleString()}</span>
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
        <Button onClick={generatePDF} className="w-full gap-2 bg-gradient-primary hover:opacity-90">
          <Download className="h-4 w-4" />
          Download Sanction Letter (PDF)
        </Button>
      </div>
    </div>
  );
};
