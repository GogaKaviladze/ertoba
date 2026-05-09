'use client'

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Shield, Users, Building2, AlertTriangle, FileText, Scale } from 'lucide-react'
import data from '@/data/fraud_case.json'

const customTooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
}

function formatGel(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ₾`
  }
  return `${value.toLocaleString()} ₾`
}

export function FraudCaseDashboard() {
  return (
    <div className="space-y-6 pb-10">
      {/* Case Summary Banner */}
      <div className="bg-red-950/30 backdrop-blur-md border border-red-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1">
              სახელმწიფო უსაფრთხოების სამსახური — 2026
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.total_suspects} პირი დააკავეს სახელმწიფო სასადილოების კონტრაქტების ფარგლებში {formatGel(data.financials.fraudulent_amount_gel)}-ის თაღლითური მითვისების ბრალდებით.
              გამოძიება მიმდინარეობს {data.legal_article}ით.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-red-500/20 mb-2">
              <Scale className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">მიტაცებული თანხა</p>
            <h3 className="text-lg sm:text-2xl font-bold text-red-400 tracking-tight">
              {formatGel(data.financials.fraudulent_amount_gel)}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/20 mb-2">
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">სულ კონტრაქტის ღირებულება</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatGel(data.financials.total_contract_value_gel)}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-amber-500/20 mb-2">
              <Users className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">ბენეფიციარი / დღე</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.total_daily_beneficiaries.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="p-2 w-fit rounded-lg bg-purple-500/20 mb-2">
              <Shield className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">დაკავებული</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.total_suspects} პირი
            </h3>
            <p className="text-[9px] sm:text-[10px] text-slate-500">
              {data.suspects_breakdown.directors} დირექტორი + {data.suspects_breakdown.employees} თანამშრომელი
            </p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contract Value by District */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">კონტრაქტები რაიონების მიხედვით</h2>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.contracts_by_district}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="district"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value) => [typeof value === 'number' ? formatGel(value) : String(value), 'კონტრაქტის ღირებულება']}
                />
                <Bar dataKey="value_gel" name="ღირებულება" radius={[4, 4, 0, 0]} fill="#6366f1" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fund Distribution Pie */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Scale className="h-5 w-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">სახელმწიფო თანხების განაწილება</h2>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.fund_distribution}
                  cx="50%"
                  cy="45%"
                  outerRadius="80%"
                  innerRadius="45%"
                  dataKey="value"
                  nameKey="label"
                  strokeWidth={0}
                  label={({ percent }) => percent !== null && percent !== undefined && percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {data.fund_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value) => [typeof value === 'number' ? formatGel(value) : String(value), '']}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Company Network */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="h-5 w-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">კომპანიების ქსელი</h2>
        </div>
        <div className="flex flex-col items-center gap-4">
          {/* Main company */}
          <div className="bg-indigo-500/15 border border-indigo-500/40 rounded-2xl px-6 py-3 text-center">
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-1">მთავარი შემსრულებელი</p>
            <p className="text-sm font-bold text-white">{data.main_company}</p>
            <p className="text-[10px] text-slate-400 mt-1">{data.total_cafeterias} სასადილო · {data.total_contracts} ხელშეკრულება</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 text-slate-600">
            <div className="w-px h-5 bg-amber-500/40" />
            <p className="text-[9px] text-amber-500/70 uppercase tracking-widest">{data.subcontracted_cafeterias} სასადილო გადაეცა</p>
            <div className="w-px h-5 bg-amber-500/40" />
          </div>

          {/* Subcontractors */}
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {data.subcontractors.map((company) => (
              <div
                key={company}
                className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 text-center flex-1 min-w-[120px] max-w-[180px]"
              >
                <p className="text-[9px] text-amber-400 uppercase tracking-widest mb-1">ქვეკონტრაქტორი</p>
                <p className="text-xs font-semibold text-white">{company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">მოვლენების ქრონოლოგია</h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10" />
          <div className="space-y-6 pl-10">
            {data.timeline.map((item) => (
              <div key={item.year} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[1.65rem] top-0.5 w-3 h-3 rounded-full border-2 ${item.amount_gel > 0 ? 'bg-red-500 border-red-400' : 'bg-indigo-500 border-indigo-400'}`} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.year}</span>
                    <p className="text-sm font-medium text-white">{item.event}</p>
                  </div>
                  {item.amount_gel > 0 && (
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full shrink-0">
                      −{formatGel(item.amount_gel)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal info */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-slate-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">სამართლებრივი საფუძველი</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">მუხლი</p>
            <p className="text-sm font-semibold text-white">{data.legal_article}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">სასჯელი</p>
            <p className="text-sm font-semibold text-white">{data.sentence_range} თავისუფლების აღკვეთა</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">პერიოდი</p>
            <p className="text-sm font-semibold text-white">{data.investigation_period}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
