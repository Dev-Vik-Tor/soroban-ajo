'use client';

import InvitationCard from '@/components/invitations/InvitationCard';
import type { Invitation, InvitationStatus } from '@/hooks/useInvitations';

interface InvitationListProps {
  title: string;
  description: string;
  invitations: Invitation[];
  emptyTitle: string;
  emptyDescription: string;
  onRespond?: (id: string, status: Extract<InvitationStatus, 'accepted' | 'declined'>) => void;
  onRevoke?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

export default function InvitationList({
  title,
  description,
  invitations,
  emptyTitle,
  emptyDescription,
  onRespond,
  onRevoke,
  onMarkRead,
}: InvitationListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {invitations.length} item{invitations.length === 1 ? '' : 's'}
        </span>
      </div>

      {invitations.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/50">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{emptyTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {invitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onRespond={onRespond}
              onRevoke={onRevoke}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      )}
    </section>
  );
}
