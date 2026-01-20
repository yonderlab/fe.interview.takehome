export interface WizardStep {
  id: string;
  title: string;
  component: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  onClick?: () => void;
}
