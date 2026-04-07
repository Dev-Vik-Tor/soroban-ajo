import React from 'react';
import { Download, Share2 } from 'lucide-react';
import { useContributionProof } from '../hooks/useContributionProof';

interface Contribution {
  member: string;
  amount: string;
  txHash: string;
  date: string;
  groupName?: string;
}

interface Props {
  contribution: Contribution;
}

export function ContributionCertificate({ contribution }: Props) {
  const { generatePDF, generateImage } = useContributionProof();

  const handleDownloadPDF = async () => {
    await generatePDF(contribution);
  };

  const handleShareImage = async () => {
    await generateImage(contribution);
  };

  return (
    <div className="rounded-xl border-4 border-yellow-400 bg-white p-8 shadow-2xl">
      <div className="text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">Certificate of Contribution</h2>
        <p className="text-lg text-gray-600">This certifies that</p>
        <p className="my-4 text-2xl font-bold text-purple-600">{contribution.member}</p>
        <p className="text-lg text-gray-600">has successfully contributed</p>
        <p className="my-4 text-3xl font-bold text-green-600">{contribution.amount} XLM</p>
        {contribution.groupName && (
          <p className="text-lg text-gray-600">to the group "{contribution.groupName}"</p>
        )}
        <p className="mt-4 text-sm text-gray-500">Transaction: {contribution.txHash}</p>
        <p className="text-sm text-gray-500">Date: {contribution.date}</p>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          onClick={handleShareImage}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          <Share2 size={16} />
          Share Image
        </button>
      </div>
    </div>
  );
}