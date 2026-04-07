import { DollarSign, Users, UserPlus, Bell } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: any;
  label: string;
  onClick: () => void;
}

export function useQuickActions(): QuickAction[] {
  // These would typically come from context or props
  // For now, we'll provide placeholder actions
  const actions: QuickAction[] = [
    {
      id: 'contribute',
      icon: DollarSign,
      label: 'Make Contribution',
      onClick: () => {
        // Navigate to contribution form or open modal
        console.log('Navigate to contribution');
      },
    },
    {
      id: 'create-group',
      icon: Users,
      label: 'Create Group',
      onClick: () => {
        // Navigate to group creation
        console.log('Navigate to create group');
      },
    },
    {
      id: 'invite-members',
      icon: UserPlus,
      label: 'Invite Members',
      onClick: () => {
        // Open invite modal
        console.log('Open invite modal');
      },
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'View Notifications',
      onClick: () => {
        // Navigate to notifications
        console.log('Navigate to notifications');
      },
    },
  ];

  return actions;
}