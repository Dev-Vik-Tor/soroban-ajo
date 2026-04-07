'use client';

import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/Button';
import type { Invitation, InvitationStatus } from '@/hooks/useInvitations';

interface InvitationCardProps {
  invitation: Invitation;
  onRespond?: (id: string, status: Extract<InvitationStatus, 'accepted' | 'declined'>) => void;
  onRevoke?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

const statusStyles: Record<InvitationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  declined: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
  revoked: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
};

const channelLabel: Record<Invitation['channel'], string> = {
  wallet: 'Wallet',
  email: 'Email',
  link: 'Link',
};

export default function InvitationCard({
  invitation,
  onRespond,
  onRevoke,
  onMarkRead,
}: InvitationCardProps) {
  const isReceived = invitation.direction === 'received';
  const canRespond = isReceived && invitation.status === 'pending';
  const canRevoke = !isReceived && invitation.status === 'pending';

  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        invitation.isRead
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-cyan-200 bg-cyan-50/70 dark:border-cyan-900 dark:bg-cyan-950/20'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[invitation.status]}`}>
              {invitation.status}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {isReceived ? 'Received' : 'Sent'}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {channelLabel[invitation.channel]}
            </span>
            {!invitation.isRead && (
              <span className="rounded-full bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white">
                New
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{invitation.groupName}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {invitation.groupDescription || 'Group invitation awaiting your action.'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right text-sm dark:bg-slate-800">
              <p className="font-medium text-slate-900 dark:text-white">
                {invitation.contributionAmount || 'Contribution not set'}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {invitation.membersCount ? `${invitation.membersCount} members expected` : 'Member count pending'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isReceived ? 'Invited by' : 'Recipient'}</p>
              <p className="mt-2 font-medium text-slate-900 dark:text-white">
                {isReceived
                  ? invitation.invitedBy
                  : invitation.recipientName || invitation.recipientAddress || 'Pending recipient'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {isReceived
                  ? invitation.invitedByAddress || 'Wallet address unavailable'
                  : invitation.recipientAddress || 'Address unavailable'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timeline</p>
              <p className="mt-2 font-medium text-slate-900 dark:text-white">
                Sent {formatDistanceToNow(invitation.invitedAt, { addSuffix: true })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {invitation.expiresAt
                  ? `Expires ${formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}`
                  : 'No expiry set'}
              </p>
            </div>
          </div>

          {invitation.message && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Message</p>
              <p className="mt-2">{invitation.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:w-44">
          {!invitation.isRead && onMarkRead && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-2xl border border-slate-200 dark:border-slate-700"
              onClick={() => onMarkRead(invitation.id)}
            >
              Mark as read
            </Button>
          )}

          {canRespond && onRespond && (
            <>
              <Button
                size="sm"
                className="rounded-2xl"
                onClick={() => onRespond(invitation.id, 'accepted')}
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-2xl"
                onClick={() => onRespond(invitation.id, 'declined')}
              >
                Decline
              </Button>
            </>
          )}

          {canRevoke && onRevoke && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              onClick={() => onRevoke(invitation.id)}
            >
              Revoke invite
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
