'use client';

import React, { useState } from 'react';

interface ProvenanceCertificateProps {
  trade: {
    tradeId: string;
    instrumentType: string;
    instrumentName: string;
    quantity: number;
    pricePerUnit: number;
    totalValue: number;
    currency: string;
    buyer: string;
    seller: string;
    timestamp: string;
    settlementMethod: string;
    settlementStatus: string;
  };
  provenance?: {
    vesselId?: string;
    vesselName?: string;
    route?: string;
    emissionsSaved?: number;
    verificationStandards?: string[];
    blockchainTxHash?: string;
    tokenStandard?: string;
    blockchainNetwork?: string;
  };
  onClose: () => void;
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'medium' });
  } catch {
    return iso;
  }
}

export default function ProvenanceCertificate({ trade, provenance, onClose }: ProvenanceCertificateProps) {
  const [hashCopied, setHashCopied] = useState(false);
  const generatedAt = new Date().toISOString();

  const copyHash = async () => {
    if (!provenance?.blockchainTxHash) return;
    try {
      await navigator.clipboard.writeText(provenance.blockchainTxHash);
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    } catch { /* Clipboard API may be unavailable */ }
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          .certificate-wrapper {
            width: 100% !important; max-width: 100% !important;
            border: 2px solid #000 !important; box-shadow: none !important;
            margin: 0 !important; padding: 32px !important;
          }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="certificate-wrapper max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border-2 border-slate-300 bg-white p-8 shadow-xl">

          {/* Certificate Header */}
          <div className="mb-6 border-b border-slate-200 pb-4 text-center">
            <div className="bloomberg-section-label mb-1 tracking-widest text-[#0EA5E9]">
              WREI TRADING PLATFORM
            </div>
            <h1 className="text-lg font-medium text-slate-900">
              Trade Confirmation &amp; Provenance Certificate
            </h1>
            <div className="bloomberg-data mt-2 text-xs text-slate-500">
              Certificate No. <span className="font-mono text-slate-700">{trade.tradeId}</span>
            </div>
          </div>

          {/* Trade Details */}
          <div className="mb-6">
            <div className="bloomberg-section-label mb-3">Trade Details</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {([
                ['Instrument', trade.instrumentName],
                ['Type', trade.instrumentType],
                ['Quantity', `${trade.quantity.toLocaleString('en-AU')} units`],
                ['Price / Unit', `${trade.currency} ${trade.pricePerUnit.toFixed(2)}`],
                ['Total Value', `${trade.currency} ${trade.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`],
                ['Buyer', trade.buyer],
                ['Seller', trade.seller],
                ['Settlement', trade.settlementMethod],
                ['Settlement Status', trade.settlementStatus],
                ['Executed', formatTimestamp(trade.timestamp)],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex flex-col py-1">
                  <span className="bloomberg-body-text text-slate-500">{label}</span>
                  <span className="bloomberg-data text-sm text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Provenance Section */}
          {provenance && (
            <div className="mb-6 rounded border border-slate-200 bg-slate-50 p-4">
              <div className="bloomberg-section-label mb-3">Provenance &amp; Verification</div>

              {provenance.verificationStandards && provenance.verificationStandards.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {provenance.verificationStandards.map((std) => (
                    <span
                      key={std}
                      className="inline-block rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 text-xs font-medium text-[#10B981]"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {([
                  ['Vessel ID', provenance.vesselId],
                  ['Vessel Name', provenance.vesselName],
                  ['Route', provenance.route],
                  ['Emissions Saved', provenance.emissionsSaved != null
                    ? `${provenance.emissionsSaved.toLocaleString('en-AU')} tCO\u2082e` : undefined],
                  ['Token Standard', provenance.tokenStandard],
                  ['Blockchain Network', provenance.blockchainNetwork],
                ] as [string, string | undefined][])
                  .filter(([, v]) => v != null)
                  .map(([label, value]) => (
                    <div key={label} className="flex flex-col py-1">
                      <span className="bloomberg-body-text text-slate-500">{label}</span>
                      <span className={`bloomberg-data text-sm ${label === 'Emissions Saved' ? 'text-[#10B981]' : 'text-slate-900'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
              </div>

              {provenance.blockchainTxHash && (
                <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
                  <span className="bloomberg-body-text text-slate-500">Tx Hash</span>
                  <code className="bloomberg-data rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-800">
                    {truncateHash(provenance.blockchainTxHash)}
                  </code>
                  <button
                    onClick={copyHash}
                    className="no-print rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                    title="Copy full transaction hash"
                  >
                    {hashCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Certificate Footer */}
          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="bloomberg-body-text text-slate-500">
              This certificate is generated by the WREI Trading Platform. Verification data is
              recorded on-chain and independently auditable.
            </p>
            <div className="bloomberg-data mt-2 text-xs text-slate-400">
              Generated {formatTimestamp(generatedAt)}
            </div>
          </div>

          {/* Action Buttons (hidden in print) */}
          <div className="no-print mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="rounded border border-[#0EA5E9] bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white hover:bg-[#0EA5E9]/90"
            >
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
