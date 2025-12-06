import { useState, useCallback } from 'react';
import { Message, AgentType, ConversationStage, LoanApplication } from '@/types/chat';
import { Customer, customers, getCustomerByPhone } from '@/data/customers';
import { OfferMartAPI, CRMAPI, CreditBureauAPI, DocumentVerificationAPI } from '@/services/mockApis';

const generateId = () => Math.random().toString(36).substring(2, 9);

const calculateEMI = (principal: number, rate: number, months: number): number => {
  const monthlyRate = rate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
};

// Persuasive responses library
const salesPhrases = {
  greeting: [
    "I noticed you have an excellent pre-approved offer waiting! This is one of our best rates this quarter.",
    "Great timing! We're running a special promotion with reduced processing fees.",
    "I've been looking at your profile, and I must say - you qualify for our premium customer benefits!"
  ],
  urgency: [
    "This special rate is only valid for the next 7 days.",
    "I can lock in this rate for you right now, before the next rate revision.",
    "Many customers with similar profiles are already enjoying these benefits."
  ],
  reassurance: [
    "Thousands of customers trust us with their financial needs every day.",
    "Our loan process is completely paperless and hassle-free.",
    "You can prepay anytime without any charges - complete flexibility!"
  ],
  negotiation: [
    "I really want to help you get the best deal. Let me check what I can do...",
    "Since you're a valued customer, I have some flexibility here.",
    "I don't usually do this, but let me offer you something special."
  ]
};

const getRandomPhrase = (category: keyof typeof salesPhrases) => {
  const phrases = salesPhrases[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

export const useChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentType>('master');
  const [visitedAgents, setVisitedAgents] = useState<AgentType[]>(['master']);
  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [isTyping, setIsTyping] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null);
  const [orchestrationLog, setOrchestrationLog] = useState<string[]>([]);

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

  const logOrchestration = useCallback((log: string) => {
    setOrchestrationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
    console.log(`🤖 Orchestration: ${log}`);
  }, []);

  const switchAgent = useCallback((agent: AgentType, reason: string) => {
    logOrchestration(`Master Agent → Switching to ${agent.toUpperCase()} Agent. Reason: ${reason}`);
    setCurrentAgent(agent);
    setVisitedAgents(prev => prev.includes(agent) ? prev : [...prev, agent]);
  }, [logOrchestration]);

  const simulateTyping = useCallback(async (duration: number = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!customer || !loanApplication) return;

    logOrchestration('Document received. Initiating verification...');
    addMessage(`📎 Uploaded: ${file.name}`, 'user');
    
    await simulateTyping(2000);

    const result = await DocumentVerificationAPI.verifySalarySlip(customer.id, file);
    
    addMessage(
      `📄 **Salary Slip Verification Complete**\n\n` +
      `✓ Document Type: Salary Slip\n` +
      `✓ Employer: ${result.extractedData.employerName}\n` +
      `✓ Gross Salary: ₹${result.extractedData.grossSalary.toLocaleString()}\n` +
      `✓ Net Salary: ₹${result.extractedData.netSalary.toLocaleString()}\n` +
      `✓ Month: ${result.extractedData.month} ${result.extractedData.year}\n` +
      `✓ Confidence: ${Math.round(result.confidence * 100)}%\n\n` +
      `Document verified successfully! ✅`,
      'agent',
      'verification'
    );

    setLoanApplication(prev => prev ? { ...prev, salarySlipUploaded: true } : null);
    
    await simulateTyping(1000);
    handleUnderwritingDecision(true);
  }, [customer, loanApplication]);

  const processUserInput = useCallback(async (input: string) => {
    addMessage(input, 'user');
    
    await simulateTyping(1000 + Math.random() * 1000);

    switch (stage) {
      case 'greeting': {
        logOrchestration('User initiated conversation. Master Agent analyzing intent...');
        
        if (input.toLowerCase().includes('loan') || input === 'interested_loan' || input === 'know_offers') {
          // Pick a random customer for demo
          const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
          setCustomer(randomCustomer);
          
          logOrchestration(`Customer identified: ${randomCustomer.name} (${randomCustomer.id}). Verifying identity...`);
          
          addMessage(
            `Welcome to Tata Capital! I'm your personal loan advisor, and I'm thrilled to assist you today.\n\n` +
            `I see you're calling from a registered number. Just to confirm - am I speaking with **${randomCustomer.name}** from **${randomCustomer.city}**?`,
            'agent',
            'master'
          );
          setStage('identification');
        } else {
          addMessage(
            "Hello! 👋 I'm your Tata Capital loan advisor. I specialize in helping customers like you find the perfect personal loan solution.\n\n" +
            "Whether it's for home renovation, a dream vacation, wedding expenses, or any personal need - I'm here to help!\n\n" +
            "Would you like to explore our exclusive loan offers?",
            'agent',
            'master'
          );
        }
        break;
      }

      case 'identification': {
        if (input === 'confirm_identity' || input.toLowerCase().includes('yes') || input.toLowerCase().includes('correct')) {
          logOrchestration(`Identity confirmed. Triggering Sales Agent for needs assessment.`);
          switchAgent('sales', 'Customer identity verified, proceeding to sales consultation');
          await simulateTyping(800);
          
          // Fetch pre-approved offers
          const offers = await OfferMartAPI.getPreApprovedOffers(customer!.id);
          
          addMessage(
            `Excellent! Great to have you with us, ${customer?.name}! I'm now connecting you with our specialist.\n\n` +
            `*Transferring to Sales Agent...*`,
            'agent',
            'master'
          );
          
          await simulateTyping(1200);
          
          let offerMessage = `Hi ${customer?.name}! 🎉 I'm your dedicated Sales Agent, and I have some exciting news!\n\n`;
          offerMessage += `Based on your excellent profile, you have a **pre-approved personal loan** of up to **₹${customer?.preApprovedLimit.toLocaleString()}**!\n\n`;
          
          if (offers?.specialOffers && offers.specialOffers.length > 0) {
            offerMessage += `🌟 **Special Benefits for You:**\n`;
            offers.specialOffers.forEach(offer => {
              offerMessage += `• ${offer}\n`;
            });
            offerMessage += '\n';
          }
          
          offerMessage += getRandomPhrase('greeting') + '\n\n';
          offerMessage += `Now, to customize the perfect offer for you - may I know what you'd like to use this loan for?`;
          
          addMessage(offerMessage, 'agent', 'sales');
          setStage('needs_assessment');
        } else if (input === 'wrong_identity' || input.toLowerCase().includes('no') || input.toLowerCase().includes('not me')) {
          logOrchestration('Identity mismatch. Requesting manual verification.');
          addMessage(
            "I apologize for the confusion! No worries, let me help you.\n\n" +
            "Could you please share your registered mobile number? I'll quickly pull up your details.",
            'agent',
            'master'
          );
        } else {
          addMessage(
            "I didn't quite catch that. Could you please confirm - are you the account holder I mentioned? Just say 'yes' or 'no'.",
            'agent',
            'master'
          );
        }
        break;
      }

      case 'needs_assessment': {
        logOrchestration('Analyzing loan purpose and preparing customized offer...');
        
        const purposes: Record<string, string> = {
          'purpose_renovation': 'home renovation',
          'purpose_medical': 'medical expenses',
          'purpose_wedding': 'wedding expenses',
          'purpose_travel': 'travel'
        };
        
        const purpose = purposes[input] || input;
        
        // Fetch dynamic rate from Offer Mart
        const offers = await OfferMartAPI.getPreApprovedOffers(customer!.id);
        const baseRate = offers?.minRate || 10.5;
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

        logOrchestration(`Offer generated: ₹${amount.toLocaleString()} @ ${baseRate}% for ${tenure} months`);

        addMessage(
          `**${purpose.charAt(0).toUpperCase() + purpose.slice(1)}** - that's a wonderful reason! 🎯\n\n` +
          `I've crafted a special offer just for you. Here's what I can do:`,
          'agent',
          'sales',
          {
            loanAmount: amount,
            tenure,
            interestRate: baseRate,
            emi
          }
        );

        await simulateTyping(800);
        
        addMessage(
          `${getRandomPhrase('urgency')}\n\n` +
          `${getRandomPhrase('reassurance')}\n\n` +
          `What do you think? Would you like to proceed with this offer, or would you like to explore different options?`,
          'agent',
          'sales'
        );
        
        setStage('offer_presentation');
        break;
      }

      case 'offer_presentation': {
        if (input === 'accept_offer' || input.toLowerCase().includes('proceed') || input.toLowerCase().includes('take') || input.toLowerCase().includes('yes')) {
          logOrchestration('Offer accepted. Triggering Verification Agent for KYC check.');
          switchAgent('verification', 'Customer accepted offer, KYC verification required');
          await simulateTyping(800);
          
          addMessage(
            "Wonderful choice! 🎉 You're making a great decision.\n\n" +
            "Let me hand you over to our Verification team for a quick, paperless KYC check. It'll only take a moment!",
            'agent',
            'sales'
          );
          
          await simulateTyping(1500);
          
          // Fetch KYC from CRM
          logOrchestration('Fetching KYC data from CRM server...');
          const kycResult = await CRMAPI.verifyKYC(customer!.id);
          
          let kycMessage = `Hello ${customer?.name}! I'm the Verification Agent.\n\n`;
          kycMessage += `🔍 **Running KYC Verification...**\n\n`;
          
          kycResult.checks.forEach(check => {
            const icon = check.status === 'pass' ? '✅' : check.status === 'pending' ? '⏳' : '❌';
            kycMessage += `${icon} ${check.name}\n`;
          });
          
          kycMessage += `\n${kycResult.message}`;
          
          addMessage(kycMessage, 'agent', 'verification');
          
          if (kycResult.success) {
            if (loanApplication) {
              setLoanApplication({ ...loanApplication, kycVerified: true, status: 'verified' });
            }
            setStage('verification');
            await simulateTyping(1000);
            handleVerificationComplete();
          } else {
            addMessage(
              "Some verification checks are pending. Please upload additional documents or visit our nearest branch.",
              'agent',
              'verification'
            );
          }
        } else if (input === 'negotiate_rate' || input.toLowerCase().includes('better rate') || input.toLowerCase().includes('discount')) {
          logOrchestration('Customer requesting rate negotiation. Checking eligibility for special rate.');
          
          const newRate = Math.max(9.25, (loanApplication?.interestRate || 10.5) - 0.5);
          const newEmi = calculateEMI(loanApplication?.requestedAmount || 300000, newRate, loanApplication?.tenure || 36);
          
          setLoanApplication(prev => prev ? { ...prev, interestRate: newRate, emi: newEmi } : null);
          
          addMessage(
            `${getRandomPhrase('negotiation')}\n\n` +
            `Given your excellent credit profile, I'm authorized to offer you an **exclusive discount**!`,
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
            `This is genuinely my best offer - I've already applied the maximum discount possible. ${getRandomPhrase('urgency')}\n\n` +
            "Shall we lock this in for you?",
            'agent',
            'sales'
          );
          setStage('negotiation');
        } else if (input === 'negotiate_amount' || input.toLowerCase().includes('higher amount') || input.toLowerCase().includes('more')) {
          logOrchestration('Customer requesting higher amount. Checking eligibility with Offer Mart...');
          
          const eligibility = await OfferMartAPI.checkEligibilityForHigherAmount(
            customer!.id, 
            (customer?.preApprovedLimit || 300000) * 2
          );
          
          addMessage(
            `I absolutely understand - you want to maximize your loan potential! Let me check what's possible...\n\n` +
            `Based on your income and profile, you could be eligible for up to **₹${eligibility.maxAmount.toLocaleString()}**! 💰\n\n` +
            (eligibility.requiresDocuments ? 
              `However, for amounts above your pre-approved limit, I'll need:\n${eligibility.documents.map(d => `• ${d}`).join('\n')}\n\n` +
              `Would you like to proceed with the higher amount (requires documents) or stick with the instant pre-approved ₹${customer?.preApprovedLimit.toLocaleString()}?` :
              `Great news - this is within your pre-approved limit! Shall I update your offer?`
            ),
            'agent',
            'sales'
          );
        } else if (input.toLowerCase().includes('not interested') || input.toLowerCase().includes('cancel') || input.toLowerCase().includes('later')) {
          logOrchestration('Customer showing hesitation. Applying retention strategy.');
          
          addMessage(
            `I completely understand! Taking time to think is always wise. 🤔\n\n` +
            `But before you go, let me share something - this pre-approved offer is based on your current excellent profile. ` +
            `If you apply later, you might need to go through a fresh credit check, and rates could be different.\n\n` +
            `The offer is valid for 7 days. Can I answer any questions or concerns you might have?`,
            'agent',
            'sales'
          );
        }
        break;
      }

      case 'negotiation': {
        if (input === 'accept_final_offer' || input.toLowerCase().includes('accept') || input.toLowerCase().includes('proceed') || input.toLowerCase().includes('yes')) {
          logOrchestration('Final offer accepted. Initiating verification process.');
          switchAgent('verification', 'Negotiated offer accepted, proceeding to KYC');
          await simulateTyping(800);
          
          addMessage(
            "Excellent decision! 🎊 I'm so glad we could work this out.\n\n" +
            "Transferring you to verification now - this will be quick and completely paperless!",
            'agent',
            'sales'
          );
          
          await simulateTyping(1500);
          
          const kycResult = await CRMAPI.verifyKYC(customer!.id);
          
          let kycMessage = `Hello again, ${customer?.name}! Quick verification in progress...\n\n`;
          kycResult.checks.forEach(check => {
            const icon = check.status === 'pass' ? '✅' : '⏳';
            kycMessage += `${icon} ${check.name}\n`;
          });
          kycMessage += `\n🎉 All checks passed! You're verified.`;
          
          addMessage(kycMessage, 'agent', 'verification');
          
          if (loanApplication) {
            setLoanApplication({ ...loanApplication, kycVerified: true, status: 'verified' });
          }
          
          setStage('verification');
          await simulateTyping(1000);
          handleVerificationComplete();
        } else {
          addMessage(
            "No pressure at all! 😊 This offer will remain valid for 7 days.\n\n" +
            "Is there anything specific you'd like to know more about? I'm here to help with any questions.",
            'agent',
            'sales'
          );
        }
        break;
      }

      case 'salary_slip_request': {
        if (input === 'upload_salary_slip' || input.toLowerCase().includes('upload')) {
          addMessage(
            "Please use the upload section below to submit your salary slip. You can drag & drop or click to browse.",
            'agent',
            'verification'
          );
          // File upload UI will be shown
        }
        break;
      }

      default:
        addMessage(
          "I'm here to help! Would you like to explore our personal loan offers? I can find you the best rates based on your profile.",
          'agent',
          'master'
        );
    }
  }, [stage, customer, loanApplication, addMessage, simulateTyping, switchAgent, logOrchestration]);

  const handleVerificationComplete = useCallback(async () => {
    logOrchestration('KYC verified. Triggering Underwriting Agent for credit assessment.');
    switchAgent('underwriting', 'KYC complete, credit scoring and eligibility check required');
    await simulateTyping(1500);
    
    // Fetch credit report from bureau
    logOrchestration('Fetching credit report from Credit Bureau API...');
    const creditReport = await CreditBureauAPI.fetchCreditScore(customer!.id);
    
    if (!creditReport) {
      addMessage(
        "Unable to fetch credit report. Please try again later.",
        'agent',
        'underwriting'
      );
      return;
    }

    const preApprovedLimit = customer?.preApprovedLimit || 300000;
    const requestedAmount = loanApplication?.requestedAmount || 300000;
    
    let underwritingMessage = `I'm the Underwriting Agent. Let me assess your loan application.\n\n`;
    underwritingMessage += `📊 **Credit Bureau Report**\n\n`;
    underwritingMessage += `• Credit Score: **${creditReport.creditScore}/900** (${creditReport.scoreCategory.toUpperCase()})\n`;
    underwritingMessage += `• Active Loans: ${creditReport.activeLoans}\n`;
    underwritingMessage += `• Payment History: ${creditReport.paymentHistory}\n`;
    underwritingMessage += `• Credit Utilization: ${creditReport.creditUtilization}%\n`;
    
    if (creditReport.recommendations.length > 0) {
      underwritingMessage += `\n💡 **Recommendations:**\n`;
      creditReport.recommendations.forEach(rec => {
        underwritingMessage += `• ${rec}\n`;
      });
    }
    
    addMessage(underwritingMessage, 'agent', 'underwriting', { creditScore: creditReport.creditScore });
    
    await simulateTyping(1500);
    
    logOrchestration(`Credit score: ${creditReport.creditScore}. Evaluating eligibility criteria...`);
    
    // Decision logic with edge cases
    if (creditReport.creditScore < 650) {
      // EDGE CASE: Low credit score - REJECTION
      logOrchestration('DECISION: Loan REJECTED due to low credit score (<650)');
      
      addMessage(
        `❌ **Application Status: Not Approved**\n\n` +
        `I regret to inform you that based on your current credit score of ${creditReport.creditScore}, we're unable to approve this loan application at this time.\n\n` +
        `**What you can do:**\n` +
        `• Pay all existing EMIs on time for the next 6 months\n` +
        `• Keep credit card utilization below 30%\n` +
        `• Avoid applying for multiple loans\n` +
        `• Check your credit report for any errors\n\n` +
        `We encourage you to reapply after 6 months. Your pre-approved offer will be reassessed at that time.`,
        'agent',
        'underwriting'
      );
      
      if (loanApplication) {
        setLoanApplication({ ...loanApplication, status: 'rejected' });
      }
      setStage('rejected');
      
    } else if (creditReport.creditScore >= 650 && creditReport.creditScore < 700) {
      // EDGE CASE: Marginal credit score - Conditional approval with higher rate
      logOrchestration('DECISION: Conditional approval with adjusted rate (score 650-700)');
      
      const adjustedRate = (loanApplication?.interestRate || 10.5) + 1.5;
      const adjustedAmount = Math.round(preApprovedLimit * 0.7);
      const adjustedEmi = calculateEMI(adjustedAmount, adjustedRate, loanApplication?.tenure || 36);
      
      addMessage(
        `⚠️ **Conditional Approval**\n\n` +
        `Your credit score falls in the "fair" range. Based on our risk assessment, I can offer you a modified loan:\n\n` +
        `• **Approved Amount:** ₹${adjustedAmount.toLocaleString()} (reduced from ₹${preApprovedLimit.toLocaleString()})\n` +
        `• **Interest Rate:** ${adjustedRate}% (risk-adjusted)\n` +
        `• **EMI:** ₹${adjustedEmi.toLocaleString()}\n\n` +
        `Alternatively, if you can provide a **guarantor** or **collateral**, we could reconsider the original amount.\n\n` +
        `Would you like to proceed with the modified offer, or explore the guarantor option?`,
        'agent',
        'underwriting',
        {
          loanAmount: adjustedAmount,
          interestRate: adjustedRate,
          emi: adjustedEmi
        }
      );
      
      setLoanApplication(prev => prev ? { 
        ...prev, 
        requestedAmount: adjustedAmount, 
        interestRate: adjustedRate, 
        emi: adjustedEmi,
        status: 'needs_documents' 
      } : null);
      setStage('negotiation');
      
    } else if (requestedAmount > preApprovedLimit) {
      // EDGE CASE: Amount exceeds pre-approved limit - Need salary slip
      logOrchestration('DECISION: Additional documentation required (amount > pre-approved limit)');
      
      const affordability = await CreditBureauAPI.checkEMIAffordability(customer!.id, loanApplication?.emi || 0);
      
      if (!affordability.affordable) {
        // EMI exceeds 50% threshold
        logOrchestration('DECISION: EMI burden too high. Reducing loan amount.');
        
        const maxAffordableAmount = Math.round(affordability.maxAffordableEMI * 36 / 0.01);
        
        addMessage(
          `⚠️ **EMI Affordability Check**\n\n` +
          `The requested loan amount would result in an EMI burden of ${affordability.proposedEMIBurden}% of your income.\n\n` +
          `Our policy allows a maximum of 50% EMI-to-income ratio.\n\n` +
          `**Your Current EMI Burden:** ${affordability.currentEMIBurden}%\n` +
          `**Maximum Additional EMI:** ₹${affordability.maxAffordableEMI.toLocaleString()}\n\n` +
          `I can approve up to ₹${Math.round(preApprovedLimit * 1.3).toLocaleString()} for you. Would you like to proceed with this revised amount?`,
          'agent',
          'underwriting'
        );
        setStage('negotiation');
      } else {
        addMessage(
          `📋 **Additional Documentation Required**\n\n` +
          `Your requested amount of ₹${requestedAmount.toLocaleString()} exceeds your pre-approved limit.\n\n` +
          `However, based on your excellent credit score of ${creditReport.creditScore}, you may be eligible! 🎯\n\n` +
          `I'll need your **latest salary slip** to verify your income and complete the assessment.\n\n` +
          `Please upload your salary slip to proceed.`,
          'agent',
          'underwriting'
        );
        
        if (loanApplication) {
          setLoanApplication({ ...loanApplication, status: 'needs_documents' });
        }
        setStage('salary_slip_request');
      }
      
    } else if (requestedAmount <= preApprovedLimit && creditReport.creditScore >= 700) {
      // Happy path: Instant approval
      logOrchestration('DECISION: Loan APPROVED. All criteria met.');
      handleUnderwritingDecision(true);
    }
  }, [customer, loanApplication, switchAgent, simulateTyping, addMessage, logOrchestration]);

  const handleUnderwritingDecision = useCallback(async (approved: boolean) => {
    if (approved) {
      if (loanApplication) {
        setLoanApplication({ ...loanApplication, status: 'approved' });
      }
      
      logOrchestration('Loan APPROVED! Triggering Sanction Letter Generator Agent.');
      
      addMessage(
        "🎉🎉🎉 **CONGRATULATIONS!** 🎉🎉🎉\n\n" +
        "Your personal loan has been **APPROVED**!\n\n" +
        "All eligibility criteria have been met. I'm now transferring you to generate your official Sanction Letter...",
        'agent',
        'underwriting',
        { status: 'approved' }
      );
      
      switchAgent('sanction', 'Loan approved, generating sanction letter');
      await simulateTyping(2000);
      
      addMessage(
        "📜 **Your Official Sanction Letter is Ready!**\n\n" +
        "This document confirms your loan approval and all terms. You can download it below.\n\n" +
        "**Next Steps:**\n" +
        "1. Review and download your Sanction Letter\n" +
        "2. Visit our nearest branch with original documents\n" +
        "3. Complete e-NACH registration for EMI deduction\n" +
        "4. Receive funds within 24-48 hours! 💰\n\n" +
        "Thank you for choosing Tata Capital. We're honored to be part of your journey! 🙏",
        'agent',
        'sanction',
        { status: 'approved' }
      );
      
      setStage('sanction_letter');
    }
  }, [loanApplication, addMessage, switchAgent, simulateTyping, logOrchestration]);

  const startConversation = useCallback(() => {
    logOrchestration('Session started. Master Agent initialized.');
    addMessage(
      "👋 **Welcome to Tata Capital's AI-Powered Loan Assistant!**\n\n" +
      "I'm your personal loan advisor, powered by our intelligent multi-agent system. I'll guide you through the entire loan process - from understanding your needs to getting your sanction letter.\n\n" +
      "🤖 Our system uses specialized AI agents:\n" +
      "• **Sales Agent** - Finds the best offers for you\n" +
      "• **Verification Agent** - Quick, paperless KYC\n" +
      "• **Underwriting Agent** - Credit assessment\n" +
      "• **Sanction Agent** - Generates your loan documents\n\n" +
      "How can I help you today?",
      'agent',
      'master'
    );
    setStage('greeting');
  }, [addMessage, logOrchestration]);

  return {
    messages,
    currentAgent,
    visitedAgents,
    stage,
    isTyping,
    customer,
    loanApplication,
    orchestrationLog,
    processUserInput,
    startConversation,
    handleFileUpload
  };
};
