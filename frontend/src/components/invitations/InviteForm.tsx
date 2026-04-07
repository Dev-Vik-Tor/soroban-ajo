'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import type { InvitationDraft } from '@/hooks/useInvitations';

interface InviteFormProps {
  inviterName: string;
  inviterAddress?: string | null;
  onSendInvite: (draft: InvitationDraft) => void;
}

interface FormState {
  groupId: string;
  groupName: string;
  groupDescription: string;
  contributionAmount: string;
  membersCount: string;
  recipientName: string;
  recipientAddress: string;
  message: string;
  channel: InvitationDraft['channel'];
}

const initialState: FormState = {
  groupId: '',
  groupName: '',
  groupDescription: '',
  contributionAmount: '',
  membersCount: '12',
  recipientName: '',
  recipientAddress: '',
  message: '',
  channel: 'wallet',
};

const normalizeGroupId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function InviteForm({
  inviterName,
  inviterAddress,
  onSendInvite,
}: InviteFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const previewGroupId = useMemo(() => {
    return form.groupId || normalizeGroupId(form.groupName);
  }, [form.groupId, form.groupName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.groupName.trim() || !form.recipientAddress.trim()) {
      setError('Group name and recipient address are required.');
      return;
    }

    const derivedGroupId = normalizeGroupId(previewGroupId);
    if (!derivedGroupId) {
      setError('Please enter a valid group name to generate a group ID.');
      return;
    }

    setError(null);

    onSendInvite({
      groupId: derivedGroupId,
      groupName: form.groupName.trim(),
      groupDescription: form.groupDescription.trim() || undefined,
      contributionAmount: form.contributionAmount.trim() || undefined,
      membersCount: Number(form.membersCount) || undefined,
      recipientName: form.recipientName.trim() || undefined,
      recipientAddress: form.recipientAddress.trim(),
      invitedBy: inviterName,
      invitedByAddress: inviterAddress || undefined,
      message: form.message.trim() || undefined,
      channel: form.channel,
      expiresInDays: 7,
    });

    setForm(initialState);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
            Send Invite
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Invite a new member
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Build a shareable invitation with a clear group summary and a note for the recipient.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p className="font-medium text-slate-900 dark:text-white">Sender</p>
          <p>{inviterName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {inviterAddress || 'No wallet connected'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Group name
          </span>
          <input
            value={form.groupName}
            onChange={(event) =>
              setForm((current) => ({ ...current, groupName: event.target.value }))
            }
            placeholder="Lagos Traders Circle"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Group ID
          </span>
          <input
            value={form.groupId}
            onChange={(event) =>
              setForm((current) => ({ ...current, groupId: event.target.value }))
            }
            placeholder={previewGroupId || 'auto-generated-from-name'}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Group description
          </span>
          <textarea
            value={form.groupDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, groupDescription: event.target.value }))
            }
            rows={3}
            placeholder="Short summary of what this savings group is for."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Contribution amount
          </span>
          <input
            value={form.contributionAmount}
            onChange={(event) =>
              setForm((current) => ({ ...current, contributionAmount: event.target.value }))
            }
            placeholder="50 XLM weekly"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Expected members
          </span>
          <input
            type="number"
            min={2}
            value={form.membersCount}
            onChange={(event) =>
              setForm((current) => ({ ...current, membersCount: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Recipient name
          </span>
          <input
            value={form.recipientName}
            onChange={(event) =>
              setForm((current) => ({ ...current, recipientName: event.target.value }))
            }
            placeholder="Mariam Bello"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Recipient wallet or email
          </span>
          <input
            value={form.recipientAddress}
            onChange={(event) =>
              setForm((current) => ({ ...current, recipientAddress: event.target.value }))
            }
            placeholder="G... or mariam@example.com"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Delivery channel
          </span>
          <select
            value={form.channel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                channel: event.target.value as InvitationDraft['channel'],
              }))
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          >
            <option value="wallet">Wallet invite</option>
            <option value="email">Email invite</option>
            <option value="link">Shareable link</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Message
          </span>
          <textarea
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
            rows={3}
            placeholder="Tell them why this group is a good fit."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-900"
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/80 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p>Preview ID: <span className="font-medium text-slate-700 dark:text-slate-200">{previewGroupId || 'pending'}</span></p>
          <p>New invitations expire after 7 days.</p>
        </div>

        <Button type="submit" size="md" className="rounded-2xl px-5 py-3">
          Send invitation
        </Button>
      </div>
    </form>
  );
}
