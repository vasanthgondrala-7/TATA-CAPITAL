import { useState, useCallback } from 'react';
import { Message, AgentType, ConversationStage, LoanApplication } from '@/types/chat';
import { Customer, customers, getCustomerByPhone } from '@/data/customers';

const generateId = () => Math.random().toString(36).substring(2, 9);

const calculateEMI = (principal: number, rate: number, months: number): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
};

export const useChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('master');
  const [visitedAgents, setVisitedAgents] = useState<AgentType[]>(['master']);
  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null);

  const addMessage = useCallback((content: string, sender: 'user' | 'agent', agent?: AgentType, metadata?: Message['metadata']) => {
    const message: Message = {
      id: generateId(),
      content,
      sender,
      agent,
      timestamp: new Date(),
      metadata
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const switchAgent = useCallback((agent: AgentType) => {
    setCurrentAgent(agent);
    setVisitedAgents(prev => prev.includes(agent) ? prev : [...prev, agent]);
  }, []);

  const simulateTyping = useCallback(async (duration: number = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  }, []);

  const processUserInput = useCallback(async (input: string) => {
    addMessage(input, 'user');
    
    await simulateTyping(1000 + Math.random() * 1000);

    switch (stage) {
      case 'greeting': {
        if (input.toLowerCase().includes('loan') || input === 'interested_loan' || input === 'know_offers') {
          // Pick a random customer for demo
          const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
          setCustomer(randomCustomer);
          
          addMessage(
            `Welcome to Tata Capital! I'm your personal loan advisor.\n\nI see you're calling from a registered number. Let me verify - are you ${randomCustomer.name} from ${randomCustomer.city}?`,
            'agent',
            'master'
          );
          setStage('identification');
        } else {
          addMessage(
            "Hello! I'm your Tata Capital loan advisor. I can help you with personal loans with attractive interest rates. Would you like to know about our loan offers?",
            'agent',
            'master'
          );
        }
        break;
      }

      case 'identification': {
        if (input === 'confirm_identity' || input.toLowerCase().includes('yes')) {
          switchAgent('sales');
          await simulateTyping(800);
          
          addMessage(
            `Great, ${customer?.name}! I'm now connecting you with our Sales specialist who will understand your needs and present the best offers for you.`,
            'agent',
            'master'
          );
          
          await simulateTyping(1200);
          
          addMessage(
            `Hi ${customer?.name}! I'm your dedicated Sales Agent. I see you have a pre-approved personal loan limit of ₹${customer?.preApprovedLimit.toLocaleString()}.\n\nMay I know the purpose of this loan? This helps me customize the best offer for you.`,
            'agent',
            'sales'
          );
          setStage('needs_assessment');
        } else {
          addMessage(
            "I apologize for the confusion. Could you please share your registered phone number so I can verify your details?",
            'agent',
            'master'
          );
        }
        break;
      }

      case 'needs_assessment': {
        const purposes: Record<string, string> = {
          'purpose_renovation': 'home renovation',
          'purpose_medical': 'medical expenses',
          'purpose_wedding': 'wedding expenses',
          'purpose_travel': 'travel'
        };
        
        const purpose = purposes[input] || input;
        
        const baseRate = 10.5;
        const amount = customer?.preApprovedLimit || 300000;
        const tenure = 36;
        const emi = calculateEMI(amount, baseRate, tenure);
        
        setLoanApplication({
          customerId: customer?.id || '',
          requestedAmount: amount,
          tenure,
          interestRate: baseRate,
          emi,
          purpose,
          status: 'pending',
          kycVerified: false,
          salarySlipUploaded: false
        });

        addMessage(
          `Excellent choice! ${purpose.charAt(0).toUpperCase() + purpose.slice(1)} is a great reason.\n\nBased on your profile, here's my special offer for you:`,
          'agent',
          'sales',
          {
            loanAmount: amount,
            tenure,
            interestRate: baseRate,
            emi
          }
        );

        await simulateTyping(500);
        addMessage(
          "This is one of the best rates we offer! Would you like to proceed with this, or would you like to discuss the terms?",
          'agent',
          'sales'
        );
        
        setStage('offer_presentation');
        break;
      }

      case 'offer_presentation': {
        if (input === 'accept_offer' || input.toLowerCase().includes('take')) {
          switchAgent('verification');
          await simulateTyping(800);
          
          addMessage(
            "Wonderful! Let me hand you over to our Verification team for a quick KYC check.",
            'agent',
            'sales'
          );
          
          await simulateTyping(1500);
          
          addMessage(
            `Hello ${customer?.name}! I'm the Verification Agent. I'm now verifying your KYC details from our CRM system...\n\n✓ Name: ${customer?.name}\n✓ Phone: ${customer?.phone}\n✓ City: ${customer?.city}\n✓ Employer: ${customer?.employerName}\n\nKYC verification successful! ✅`,
            'agent',
            'verification'
          );
          
          if (loanApplication) {
            setLoanApplication({ ...loanApplication, kycVerified: true, status: 'verified' });
          }
          
          setStage('verification');
          
          await simulateTyping(1000);
          handleVerificationComplete();
        } else if (input === 'negotiate_rate' || input.toLowerCase().includes('better rate')) {
          const newRate = (loanApplication?.interestRate || 10.5) - 0.25;
          const newEmi = calculateEMI(loanApplication?.requestedAmount || 300000, newRate, loanApplication?.tenure || 36);
          
          setLoanApplication(prev => prev ? { ...prev, interestRate: newRate, emi: newEmi } : null);
          
          addMessage(
            `I understand you're looking for a better rate. Since you're a valued customer with an excellent profile, I can offer you a special discount:`,
            'agent',
            'sales',
            {
              loanAmount: loanApplication?.requestedAmount,
              tenure: loanApplication?.tenure,
              interestRate: newRate,
              emi: newEmi
            }
          );
          
          await simulateTyping(500);
          addMessage(
            "This is my best offer - an exclusive rate just for you! Shall we proceed?",
            'agent',
            'sales'
          );
          setStage('negotiation');
        } else if (input === 'negotiate_amount' || input.toLowerCase().includes('higher amount')) {
          const newAmount = Math.min((customer?.preApprovedLimit || 300000) * 2, (customer?.monthlyIncome || 50000) * 20);
          
          addMessage(
            `I can certainly check for a higher amount! Based on your income, you may be eligible for up to ₹${newAmount.toLocaleString()}, but this would require additional documentation like a salary slip.\n\nWould you like to proceed with the higher amount, or stick with the pre-approved ₹${customer?.preApprovedLimit.toLocaleString()}?`,
            'agent',
            'sales'
          );
        }
        break;
      }

      case 'negotiation': {
        if (input === 'accept_final_offer' || input.toLowerCase().includes('accept')) {
          switchAgent('verification');
          await simulateTyping(800);
          
          addMessage(
            "Excellent decision! Transferring you to our Verification team now.",
            'agent',
            'sales'
          );
          
          await simulateTyping(1500);
          
          addMessage(
            `Hello ${customer?.name}! Quick KYC verification in progress...\n\n✓ Identity Verified\n✓ Address Confirmed\n✓ Employment Verified\n\nAll checks passed! ✅`,
            'agent',
            'verification'
          );
          
          if (loanApplication) {
            setLoanApplication({ ...loanApplication, kycVerified: true, status: 'verified' });
          }
          
          setStage('verification');
          await simulateTyping(1000);
          handleVerificationComplete();
        } else {
          addMessage(
            "No problem! Take your time. The offer is valid for 7 days. Is there anything else you'd like to know about the loan?",
            'agent',
            'sales'
          );
        }
        break;
      }

      case 'salary_slip_request': {
        if (input === 'upload_salary_slip' || input.toLowerCase().includes('upload')) {
          await simulateTyping(2000);
          
          addMessage(
            "📄 Salary slip received and verified!\n\nMonthly Salary: ₹" + customer?.monthlyIncome.toLocaleString() + "\nEmployer: " + customer?.employerName + "\n\nDocument verification complete. ✅",
            'agent',
            'verification'
          );
          
          if (loanApplication) {
            setLoanApplication({ ...loanApplication, salarySlipUploaded: true });
          }
          
          await simulateTyping(1000);
          handleUnderwritingDecision(true);
        }
        break;
      }

      default:
        addMessage(
          "I'm here to help! Would you like to know more about our personal loan offers?",
          'agent',
          'master'
        );
    }
  }, [stage, customer, loanApplication, addMessage, simulateTyping, switchAgent]);

  const handleVerificationComplete = useCallback(async () => {
    switchAgent('underwriting');
    await simulateTyping(1500);
    
    const creditScore = customer?.creditScore || 700;
    const preApprovedLimit = customer?.preApprovedLimit || 300000;
    const requestedAmount = loanApplication?.requestedAmount || 300000;
    
    addMessage(
      `I'm the Underwriting Agent. Fetching your credit score from the bureau...\n\n📊 Credit Score: ${creditScore}/900`,
      'agent',
      'underwriting',
      { creditScore }
    );
    
    await simulateTyping(1500);
    
    // Decision logic
    if (creditScore < 700) {
      // Reject if credit score < 700
      addMessage(
        `I regret to inform you that based on the credit score of ${creditScore}, we are unable to approve this loan at this time.\n\nWe recommend improving your credit score and reapplying after 6 months. Tips:\n• Pay existing EMIs on time\n• Reduce credit card utilization\n• Avoid multiple loan applications`,
        'agent',
        'underwriting'
      );
      
      if (loanApplication) {
        setLoanApplication({ ...loanApplication, status: 'rejected' });
      }
      setStage('rejected');
    } else if (requestedAmount <= preApprovedLimit) {
      // Instant approval if within pre-approved limit
      handleUnderwritingDecision(true);
    } else if (requestedAmount <= preApprovedLimit * 2) {
      // Request salary slip if amount is 1x-2x pre-approved
      const currentEmi = loanApplication?.emi || 0;
      const existingEmis = customer?.currentLoans.reduce((sum, loan) => sum + loan.emi, 0) || 0;
      const totalEmi = currentEmi + existingEmis;
      const maxAllowedEmi = (customer?.monthlyIncome || 50000) * 0.5;
      
      if (totalEmi <= maxAllowedEmi) {
        addMessage(
          `Your requested amount of ₹${requestedAmount.toLocaleString()} exceeds your pre-approved limit. However, based on your excellent credit score, you may be eligible.\n\nI'll need your latest salary slip for verification. Please upload it to proceed.`,
          'agent',
          'underwriting'
        );
        
        if (loanApplication) {
          setLoanApplication({ ...loanApplication, status: 'needs_documents' });
        }
        setStage('salary_slip_request');
      } else {
        addMessage(
          `Based on our calculations, the EMI for this loan amount would exceed 50% of your monthly income, which is our maximum threshold.\n\nI can approve up to ₹${Math.round(preApprovedLimit * 1.5).toLocaleString()} for you. Would you like to proceed with this amount instead?`,
          'agent',
          'underwriting'
        );
      }
    } else {
      // Reject if > 2x pre-approved
      addMessage(
        `The requested amount of ₹${requestedAmount.toLocaleString()} is more than 2x your pre-approved limit of ₹${preApprovedLimit.toLocaleString()}.\n\nWe can approve up to ₹${(preApprovedLimit * 2).toLocaleString()} with additional documentation. Would you like to revise your loan amount?`,
        'agent',
        'underwriting'
      );
    }
  }, [customer, loanApplication, switchAgent, simulateTyping, addMessage]);

  const handleUnderwritingDecision = useCallback(async (approved: boolean) => {
    if (approved) {
      if (loanApplication) {
        setLoanApplication({ ...loanApplication, status: 'approved' });
      }
      
      addMessage(
        "🎉 Congratulations! Your loan has been APPROVED!\n\nAll eligibility criteria met. Transferring you to generate your sanction letter...",
        'agent',
        'underwriting',
        { status: 'approved' }
      );
      
      switchAgent('sanction');
      await simulateTyping(2000);
      
      addMessage(
        "Your official Sanction Letter is ready! You can download it below. Please visit our nearest branch with original documents for loan disbursement.",
        'agent',
        'sanction',
        { status: 'approved' }
      );
      
      setStage('sanction_letter');
    }
  }, [loanApplication, addMessage, switchAgent, simulateTyping]);

  const startConversation = useCallback(() => {
    addMessage(
      "👋 Hello! Welcome to Tata Capital's Personal Loan Assistant.\n\nI'm your AI-powered loan advisor, and I'm here to help you get the best personal loan offer tailored just for you.\n\nHow can I assist you today?",
      'agent',
      'master'
    );
    setStage('greeting');
  }, [addMessage]);

  return {
    messages,
    currentAgent,
    visitedAgents,
    stage,
    isTyping,
    customer,
    loanApplication,
    processUserInput,
    startConversation
  };
};
