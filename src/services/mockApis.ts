// Mock API Services - Simulating backend servers

import { Customer, getCustomerById, getCustomerByPhone } from '@/data/customers';

// ============= OFFER MART SERVER =============
export interface LoanOffer {
  offerId: string;
  customerId: string;
  preApprovedAmount: number;
  minRate: number;
  maxRate: number;
  maxTenure: number;
  validUntil: Date;
  specialOffers: string[];
}

export const OfferMartAPI = {
  async getPreApprovedOffers(customerId: string): Promise<LoanOffer | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const customer = getCustomerById(customerId);
    if (!customer) return null;

    // Dynamic offer based on customer profile
    const baseRate = customer.creditScore >= 800 ? 9.5 : 
                     customer.creditScore >= 750 ? 10.25 : 
                     customer.creditScore >= 700 ? 10.99 : 11.5;

    const specialOffers: string[] = [];
    if (customer.creditScore >= 800) specialOffers.push("Premium Customer - 0.5% rate discount");
    if (customer.currentLoans.length === 0) specialOffers.push("New Loan Bonus - Processing fee waived");
    if (customer.monthlyIncome >= 100000) specialOffers.push("High Income Benefit - Instant approval");

    return {
      offerId: `OFFER-${customerId}-${Date.now()}`,
      customerId,
      preApprovedAmount: customer.preApprovedLimit,
      minRate: baseRate,
      maxRate: baseRate + 2,
      maxTenure: customer.creditScore >= 750 ? 60 : 48,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      specialOffers
    };
  },

  async checkEligibilityForHigherAmount(customerId: string, requestedAmount: number): Promise<{
    eligible: boolean;
    maxAmount: number;
    requiresDocuments: boolean;
    documents: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const customer = getCustomerById(customerId);
    if (!customer) return { eligible: false, maxAmount: 0, requiresDocuments: false, documents: [] };

    const maxBasedOnIncome = customer.monthlyIncome * 20;
    const maxWithDocs = Math.min(customer.preApprovedLimit * 2, maxBasedOnIncome);

    return {
      eligible: requestedAmount <= maxWithDocs,
      maxAmount: maxWithDocs,
      requiresDocuments: requestedAmount > customer.preApprovedLimit,
      documents: requestedAmount > customer.preApprovedLimit ? 
        ['Latest 3 months salary slip', 'Bank statement'] : []
    };
  }
};

// ============= CRM SERVER (KYC Data) =============
export interface KYCData {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  panNumber: string;
  aadhaarLast4: string;
  employmentType: 'salaried' | 'self_employed' | 'business';
  employerName: string;
  designation: string;
  employmentYears: number;
  verificationStatus: 'verified' | 'pending' | 'failed';
  lastUpdated: Date;
}

export const CRMAPI = {
  async getKYCData(customerId: string): Promise<KYCData | null> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const customer = getCustomerById(customerId);
    if (!customer) return null;

    // Simulate different verification statuses
    const verificationStatus = customer.creditScore >= 650 ? 'verified' : 'pending';

    return {
      customerId,
      fullName: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
      city: customer.city,
      panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
      aadhaarLast4: `${Math.floor(1000 + Math.random() * 9000)}`,
      employmentType: customer.occupation === 'Business Owner' ? 'self_employed' : 'salaried',
      employerName: customer.employerName,
      designation: customer.occupation,
      employmentYears: Math.floor(customer.age / 5),
      verificationStatus,
      lastUpdated: new Date()
    };
  },

  async verifyKYC(customerId: string): Promise<{
    success: boolean;
    checks: { name: string; status: 'pass' | 'fail' | 'pending' }[];
    message: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const customer = getCustomerById(customerId);
    if (!customer) {
      return {
        success: false,
        checks: [],
        message: 'Customer not found in system'
      };
    }

    const checks = [
      { name: 'Identity Verification', status: 'pass' as const },
      { name: 'Address Verification', status: 'pass' as const },
      { name: 'PAN Validation', status: 'pass' as const },
      { name: 'Employment Verification', status: customer.employerName ? 'pass' as const : 'pending' as const },
      { name: 'Phone Verification', status: 'pass' as const }
    ];

    const allPassed = checks.every(c => c.status === 'pass');

    return {
      success: allPassed,
      checks,
      message: allPassed ? 'All KYC checks passed successfully' : 'Some checks require manual verification'
    };
  }
};

// ============= CREDIT BUREAU API =============
export interface CreditReport {
  customerId: string;
  creditScore: number;
  scoreCategory: 'excellent' | 'good' | 'fair' | 'poor';
  reportDate: Date;
  activeLoans: number;
  totalOutstanding: number;
  paymentHistory: 'excellent' | 'good' | 'average' | 'poor';
  creditUtilization: number;
  hardInquiries: number;
  recommendations: string[];
}

export const CreditBureauAPI = {
  async fetchCreditScore(customerId: string): Promise<CreditReport | null> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const customer = getCustomerById(customerId);
    if (!customer) return null;

    const score = customer.creditScore;
    const scoreCategory = score >= 800 ? 'excellent' : 
                         score >= 750 ? 'good' : 
                         score >= 650 ? 'fair' : 'poor';

    const recommendations: string[] = [];
    if (score < 750) recommendations.push('Pay all EMIs on time to improve score');
    if (customer.currentLoans.length > 2) recommendations.push('Consider consolidating existing loans');
    if (score >= 800) recommendations.push('Excellent score! You qualify for premium rates');

    return {
      customerId,
      creditScore: score,
      scoreCategory,
      reportDate: new Date(),
      activeLoans: customer.currentLoans.length,
      totalOutstanding: customer.currentLoans.reduce((sum, loan) => sum + loan.amount, 0),
      paymentHistory: score >= 750 ? 'excellent' : score >= 700 ? 'good' : 'average',
      creditUtilization: Math.round((customer.currentLoans.reduce((sum, loan) => sum + loan.emi, 0) / customer.monthlyIncome) * 100),
      hardInquiries: Math.floor(Math.random() * 3),
      recommendations
    };
  },

  async checkEMIAffordability(customerId: string, proposedEMI: number): Promise<{
    affordable: boolean;
    currentEMIBurden: number;
    proposedEMIBurden: number;
    maxAffordableEMI: number;
    message: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const customer = getCustomerById(customerId);
    if (!customer) {
      return {
        affordable: false,
        currentEMIBurden: 0,
        proposedEMIBurden: 0,
        maxAffordableEMI: 0,
        message: 'Customer not found'
      };
    }

    const currentEMI = customer.currentLoans.reduce((sum, loan) => sum + loan.emi, 0);
    const currentBurden = (currentEMI / customer.monthlyIncome) * 100;
    const proposedBurden = ((currentEMI + proposedEMI) / customer.monthlyIncome) * 100;
    const maxEMI = customer.monthlyIncome * 0.5 - currentEMI;

    return {
      affordable: proposedBurden <= 50,
      currentEMIBurden: Math.round(currentBurden),
      proposedEMIBurden: Math.round(proposedBurden),
      maxAffordableEMI: Math.max(0, maxEMI),
      message: proposedBurden <= 50 ? 
        'EMI is within affordable range' : 
        `EMI exceeds 50% income threshold. Maximum affordable EMI: ₹${Math.max(0, maxEMI).toLocaleString()}`
    };
  }
};

// ============= DOCUMENT VERIFICATION API =============
export interface DocumentVerificationResult {
  documentType: 'salary_slip' | 'bank_statement' | 'pan_card' | 'aadhaar';
  verified: boolean;
  extractedData: Record<string, any>;
  confidence: number;
  issues: string[];
}

export const DocumentVerificationAPI = {
  async verifySalarySlip(customerId: string, _file: File): Promise<DocumentVerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const customer = getCustomerById(customerId);
    
    // Simulate OCR and verification
    return {
      documentType: 'salary_slip',
      verified: true,
      extractedData: {
        employerName: customer?.employerName || 'Unknown',
        grossSalary: customer?.monthlyIncome || 0,
        netSalary: Math.round((customer?.monthlyIncome || 0) * 0.85),
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        employeeId: `EMP${Math.floor(10000 + Math.random() * 90000)}`
      },
      confidence: 0.95,
      issues: []
    };
  },

  async verifyBankStatement(customerId: string, _file: File): Promise<DocumentVerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const customer = getCustomerById(customerId);
    const avgBalance = (customer?.monthlyIncome || 50000) * 2;
    
    return {
      documentType: 'bank_statement',
      verified: true,
      extractedData: {
        accountHolder: customer?.name || 'Unknown',
        averageBalance: avgBalance,
        salaryCredits: 3,
        bounceCount: 0,
        period: 'Last 3 months'
      },
      confidence: 0.92,
      issues: []
    };
  }
};
