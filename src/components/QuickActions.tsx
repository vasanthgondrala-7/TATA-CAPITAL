import { Button } from "@/components/ui/button";
import { ConversationStage } from "@/types/chat";

interface QuickActionsProps {
  stage: ConversationStage;
  onAction: (action: string) => void;
}

const stageActions: Partial<Record<ConversationStage, { label: string; value: string }[]>> = {
  greeting: [
    { label: "I'm interested in a personal loan", value: "interested_loan" },
    { label: "Tell me about your offers", value: "know_offers" }
  ],
  identification: [
    { label: "Yes, that's me", value: "confirm_identity" }
  ],
  needs_assessment: [
    { label: "For home renovation", value: "purpose_renovation" },
    { label: "For medical emergency", value: "purpose_medical" },
    { label: "For wedding expenses", value: "purpose_wedding" },
    { label: "For travel", value: "purpose_travel" }
  ],
  offer_presentation: [
    { label: "I'll take this offer", value: "accept_offer" },
    { label: "Can I get a better rate?", value: "negotiate_rate" },
    { label: "I need a higher amount", value: "negotiate_amount" }
  ],
  negotiation: [
    { label: "Okay, I accept", value: "accept_final_offer" },
    { label: "Let me think about it", value: "think_about" }
  ],
  salary_slip_request: [
    { label: "📎 Upload Salary Slip", value: "upload_salary_slip" }
  ]
};

export const QuickActions = ({ stage, onAction }: QuickActionsProps) => {
  const actions = stageActions[stage];
  
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in-up">
      {actions.map((action) => (
        <Button
          key={action.value}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.value)}
          className="rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
