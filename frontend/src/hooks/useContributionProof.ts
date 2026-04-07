import { useState, useCallback } from 'react';
import { generatePDF, generateImage, verifyOnBlockchain } from '../utils/certificateGenerator';

interface Contribution {
  member: string;
  amount: string;
  txHash: string;
  date: string;
  groupName?: string;
}

export function useContributionProof() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCertificatePDF = useCallback(async (contribution: Contribution) => {
    setIsGenerating(true);
    try {
      await generatePDF(contribution);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateCertificateImage = useCallback(async (contribution: Contribution) => {
    setIsGenerating(true);
    try {
      await generateImage(contribution);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const verifyContribution = useCallback(async (txHash: string) => {
    return await verifyOnBlockchain(txHash);
  }, []);

  return {
    generatePDF: generateCertificatePDF,
    generateImage: generateCertificateImage,
    verifyContribution,
    isGenerating,
  };
}