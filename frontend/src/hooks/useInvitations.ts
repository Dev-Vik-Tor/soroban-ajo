'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateInviteCode } from '@/utils/shareUtils';

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'revoked'
  | 'expired';

export type InvitationDirection = 'sent' | 'received';
export type InvitationChannel = 'wallet' | 'email' | 'link';

export interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  groupDescription?: string;
  contributionAmount?: string;
  membersCount?: number;
  invitedBy: string;
  invitedByAddress?: string;
  recipientName?: string;
  recipientAddress?: string;
  message?: string;
  invitedAt: number;
  expiresAt?: number;
  respondedAt?: number;
  status: InvitationStatus;
  direction: InvitationDirection;
  channel: InvitationChannel;
  inviteCode: string;
  isRead?: boolean;
}

export interface InvitationDraft {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  contributionAmount?: string;
  membersCount?: number;
  recipientName?: string;
  recipientAddress: string;
  invitedBy: string;
  invitedByAddress?: string;
  message?: string;
  channel?: InvitationChannel;
  expiresInDays?: number;
}

interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  unread: number;
}

interface InvitationsState {
  invitations: Invitation[];
  addInvitation: (invitation: Invitation) => void;
  createInvitation: (draft: InvitationDraft) => Invitation;
  updateInvitationStatus: (id: string, status: InvitationStatus) => void;
  markInvitationRead: (id: string) => void;
  markAllAsRead: () => void;
  revokeInvitation: (id: string) => void;
  getInvitationByCode: (code: string) => Invitation | undefined;
  getReceivedInvitations: () => Invitation[];
  getSentInvitations: () => Invitation[];
  getPendingInvitations: () => Invitation[];
  getStats: () => InvitationStats;
  seedDemoData: () => void;
}

const now = Date.now();

const demoInvitations: Invitation[] = [
  {
    id: 'received-demo-1',
    groupId: 'market-women-circle',
    groupName: 'Market Women Circle',
    groupDescription: 'Weekly contributions for traders building emergency and expansion capital.',
    contributionAmount: '50 XLM weekly',
    membersCount: 8,
    invitedBy: 'Ada Nwosu',
    invitedByAddress: 'GB2A...ADA7',
    recipientName: 'You',
    recipientAddress: 'demo-wallet',
    message: 'We would love to have you join the next savings round.',
    invitedAt: now - 1000 * 60 * 60 * 4,
    expiresAt: now + 1000 * 60 * 60 * 24 * 3,
    status: 'pending',
    direction: 'received',
    channel: 'wallet',
    inviteCode: generateInviteCode('market-women-circle'),
    isRead: false,
  },
  {
    id: 'received-demo-2',
    groupId: 'tech-founders-pool',
    groupName: 'Tech Founders Pool',
    groupDescription: 'A monthly pool for startup operators saving toward infra and payroll buffers.',
    contributionAmount: '120 XLM monthly',
    membersCount: 5,
    invitedBy: 'Kunle Adebayo',
    invitedByAddress: 'GDK9...KUN3',
    recipientName: 'You',
    recipientAddress: 'demo-wallet',
    message: 'Your product ops background would be a great fit for this group.',
    invitedAt: now - 1000 * 60 * 60 * 28,
    expiresAt: now + 1000 * 60 * 60 * 12,
    respondedAt: now - 1000 * 60 * 30,
    status: 'accepted',
    direction: 'received',
    channel: 'wallet',
    inviteCode: generateInviteCode('tech-founders-pool'),
    isRead: true,
  },
  {
    id: 'sent-demo-1',
    groupId: 'family-coop',
    groupName: 'Family Cooperative Fund',
    groupDescription: 'Shared family savings for school fees, rent support, and urgent bills.',
    contributionAmount: '75 XLM bi-weekly',
    membersCount: 11,
    invitedBy: 'You',
    invitedByAddress: 'GABC...YOU1',
    recipientName: 'David Ojo',
    recipientAddress: 'GDM9...DAV4',
    message: 'Join us before the next disbursement cycle starts.',
    invitedAt: now - 1000 * 60 * 60 * 18,
    expiresAt: now + 1000 * 60 * 60 * 24 * 5,
    status: 'pending',
    direction: 'sent',
    channel: 'wallet',
    inviteCode: generateInviteCode('family-coop'),
    isRead: true,
  },
  {
    id: 'sent-demo-2',
    groupId: 'creative-guild',
    groupName: 'Creative Guild Fund',
    groupDescription: 'Savings circle for designers and makers pooling capital for tools and gigs.',
    contributionAmount: '30 XLM weekly',
    membersCount: 14,
    invitedBy: 'You',
    invitedByAddress: 'GABC...YOU1',
    recipientName: 'Mariam Bello',
    recipientAddress: 'mariam@example.com',
    message: 'You asked for the invite link. Here it is.',
    invitedAt: now - 1000 * 60 * 60 * 48,
    expiresAt: now + 1000 * 60 * 60 * 24,
    respondedAt: now - 1000 * 60 * 60 * 6,
    status: 'declined',
    direction: 'sent',
    channel: 'email',
    inviteCode: generateInviteCode('creative-guild'),
    isRead: true,
  },
];

const sortByNewest = (invitations: Invitation[]) =>
  [...invitations].sort((a, b) => b.invitedAt - a.invitedAt);

const upsertInvitation = (
  invitations: Invitation[],
  invitation: Invitation
): Invitation[] => {
  const existingIndex = invitations.findIndex((item) => item.id === invitation.id);

  if (existingIndex === -1) {
    return sortByNewest([invitation, ...invitations]);
  }

  const next = [...invitations];
  next[existingIndex] = invitation;
  return sortByNewest(next);
};

export const useInvitations = create<InvitationsState>()(
  persist(
    (set, get) => ({
      invitations: [],

      addInvitation: (invitation) =>
        set((state) => ({
          invitations: upsertInvitation(state.invitations, invitation),
        })),

      createInvitation: (draft) => {
        const invitation: Invitation = {
          id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          groupId: draft.groupId,
          groupName: draft.groupName,
          groupDescription: draft.groupDescription,
          contributionAmount: draft.contributionAmount,
          membersCount: draft.membersCount,
          invitedBy: draft.invitedBy,
          invitedByAddress: draft.invitedByAddress,
          recipientName: draft.recipientName,
          recipientAddress: draft.recipientAddress,
          message: draft.message,
          invitedAt: Date.now(),
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * (draft.expiresInDays ?? 7),
          status: 'pending',
          direction: 'sent',
          channel: draft.channel ?? 'wallet',
          inviteCode: generateInviteCode(draft.groupId),
          isRead: true,
        };

        set((state) => ({
          invitations: upsertInvitation(state.invitations, invitation),
        }));

        return invitation;
      },

      updateInvitationStatus: (id, status) =>
        set((state) => ({
          invitations: state.invitations.map((invitation) =>
            invitation.id === id
              ? {
                  ...invitation,
                  status,
                  respondedAt:
                    status === 'accepted' || status === 'declined' || status === 'expired'
                      ? Date.now()
                      : invitation.respondedAt,
                  isRead: true,
                }
              : invitation
          ),
        })),

      markInvitationRead: (id) =>
        set((state) => ({
          invitations: state.invitations.map((invitation) =>
            invitation.id === id ? { ...invitation, isRead: true } : invitation
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          invitations: state.invitations.map((invitation) => ({
            ...invitation,
            isRead: true,
          })),
        })),

      revokeInvitation: (id) =>
        set((state) => ({
          invitations: state.invitations.map((invitation) =>
            invitation.id === id
              ? {
                  ...invitation,
                  status: 'revoked',
                  respondedAt: Date.now(),
                  isRead: true,
                }
              : invitation
          ),
        })),

      getInvitationByCode: (code) => {
        const { invitations } = get();
        return invitations.find((invitation) => invitation.inviteCode === code);
      },

      getReceivedInvitations: () => {
        const { invitations } = get();
        return sortByNewest(
          invitations.filter((invitation) => invitation.direction === 'received')
        );
      },

      getSentInvitations: () => {
        const { invitations } = get();
        return sortByNewest(
          invitations.filter((invitation) => invitation.direction === 'sent')
        );
      },

      getPendingInvitations: () => {
        const { invitations } = get();
        return sortByNewest(
          invitations.filter((invitation) => invitation.status === 'pending')
        );
      },

      getStats: () => {
        const { invitations } = get();

        return {
          total: invitations.length,
          pending: invitations.filter((invitation) => invitation.status === 'pending').length,
          accepted: invitations.filter((invitation) => invitation.status === 'accepted').length,
          declined: invitations.filter((invitation) => invitation.status === 'declined').length,
          unread: invitations.filter((invitation) => !invitation.isRead).length,
        };
      },

      seedDemoData: () => {
        const { invitations } = get();

        if (invitations.length > 0) {
          return;
        }

        set({ invitations: demoInvitations });
      },
    }),
    {
      name: 'ajo-invitations-storage',
      partialize: (state) => ({
        invitations: state.invitations,
      }),
    }
  )
);
