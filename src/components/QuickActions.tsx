import { Button } from "@/components/ui/button";
import { ConversationStage } from "@/types/chat";
import { Home, Heart, Plane, PartyPopper, CheckCircle, TrendingDown, TrendingUp, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

interface QuickActionsProps {
  stage: ConversationStage;
  onAction: (action: string) => void;
}

const stageActions: Partial<Record<ConversationStage, { label: string; value: string; icon?: React.ReactNode; variant?: 'default' | 'outline' | 'secondary' }[]>> = {
  greeting: [
    { label: "I'm interested in a loan", value: "interested_loan", icon: <CheckCircle className="h-4 w-4" /> },
    { label: "What offers do you have?", value: "know_offers", icon: <TrendingUp className="h-4 w-4" /> }
  ],
  identification: [
    { label: "Yes, that's me!", value: "confirm_identity", icon: <ThumbsUp className="h-4 w-4" /> },
    { label: "No, wrong person", value: "wrong_identity", icon: <ThumbsDown className="h-4 w-4" />, variant: 'outline' }
  ],
  needs_assessment: [
    { label: "Home Renovation", value: "purpose_renovation", icon: <Home className="h-4 w-4" /> },
    { label: "Medical", value: "purpose_medical", icon: <Heart className="h-4 w-4" /> },
    { label: "Wedding", value: "purpose_wedding", icon: <PartyPopper className="h-4 w-4" /> },
    { label: "Travel", value: "purpose_travel", icon: <Plane className="h-4 w-4" /> }
  ],
  offer_presentation: [
    { label: "I'll take this!", value: "accept_offer", icon: <CheckCircle className="h-4 w-4" /> },
    { label: "Better rate?", value: "negotiate_rate", icon: <TrendingDown className="h-4 w-4" />, variant: 'outline' },
    { label: "Higher amount", value: "negotiate_amount", icon: <TrendingUp className="h-4 w-4" />, variant: 'outline' },
    { label: "Let me think...", value: "not_interested", icon: <Clock className="h-4 w-4" />, variant: 'secondary' }
  ],
  negotiation: [
    { label: "Accept offer", value: "accept_final_offer", icon: <CheckCircle className="h-4 w-4" /> },
    { label: "Need more time", value: "need_time", icon: <Clock className="h-4 w-4" />, variant: 'outline' }
  ]
};

export const QuickActions = ({ stage, onAction }: QuickActionsProps) => {
  const actions = stageActions[stage];
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
      {actions.map((action) => (
        <Button
          key={action.value}
          variant={action.variant || 'default'}
          size="sm"
          onClick={() => onAction(action.value)}
          className={`rounded-full gap-2 transition-all hover:scale-105 ${
            action.variant === 'outline' ? 'border-primary/30 hover:bg-primary/10' : 
            action.variant === 'secondary' ? 'bg-muted hover:bg-muted/80' :
            'bg-gradient-primary text-primary-foreground shadow-md'
          }`}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
};
