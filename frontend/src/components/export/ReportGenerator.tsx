'use client';

import { ExportData } from '@/utils/pdfGenerator';
import { formatCurrency, formatDate } from '@/utils/exportHelpers';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

interface ReportGeneratorProps {
  data: ExportData;
}

export function ReportGenerator({ data }: ReportGeneratorProps) {
  const avgContribution = data.totalContributed / data.members.length;
  const topContributor = data.members.reduce((max, m) => 
    m.contributions > max.contributions ? m : max
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Report Summary
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Contributed</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.totalContributed)}
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">Average per Member</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(avgContribution)}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">Total Members</div>
          <div className="text-2xl font-bold text-purple-600">
            {data.members.length}
          </div>
        </div>
      </div>

      {/* Top Contributor */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 font-semibold text-amber-900 mb-2">
          <TrendingUp className="w-4 h-4" />
          Top Contributor
        </div>
        <div className="text-lg font-bold text-amber-600">
          {topContributor.name}
        </div>
        <div className="text-sm text-amber-700">
          {formatCurrency(topContributor.contributions)}
        </div>
      </div>

      {/* Members Table */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-right">Contribution</th>
                <th className="px-4 py-2 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.members.map((member) => (
                <tr key={member.address} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{member.name}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(member.contributions)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {((member.contributions / data.totalContributed) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Contributions */}
      <div>
        <h3 className="font-semibold mb-3">Recent Contributions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.contributions.slice(0, 10).map((contrib, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">{contrib.member}</div>
                <div className="text-xs text-gray-600">{formatDate(contrib.date)}</div>
              </div>
              <div className="font-semibold">{formatCurrency(contrib.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
