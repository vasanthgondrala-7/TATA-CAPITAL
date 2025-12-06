export type AgentType = 'master' | 'sales' | 'verification' | 'underwriting' | 'sanction';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  agent?: AgentType;
  timestamp: Date;
  metadata?: {
    loanAmount?: number;
    tenure?: number;
    interestRate?: number;
    emi?: number;
    status?: 'approved' | 'rejected' | 'pending' | 'needs_documents';
    creditScore?: number;
  };
}

export interface LoanApplication {
  customerId: string;
  requestedAmount: number;
  tenure: number;
  interestRate: number;
  emi: number;
  purpose: string;
  status: 'pending' | 'verified' | 'underwriting' | 'approved' | 'rejected' | 'needs_documents';
  creditScore?: number;
  kycVerified: boolean;
  salarySlipUploaded: boolean;
}

export type ConversationStage = 
  | 'greeting'
  | 'identification'
  | 'needs_assessment'
  | 'offer_presentation'
  | 'negotiation'
  | 'verification'
  | 'underwriting'
  | 'salary_slip_request'
  | 'final_decision'
  | 'sanction_letter'
  | 'completed'
  | 'rejected';
