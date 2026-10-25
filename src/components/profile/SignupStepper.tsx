import React from 'react';
import { Check } from 'lucide-react';

export function SignupStepper({ step }: { step: 1 | 2 }) {
  const items = ['Account', 'Your Profile'];
  return (
    <div className="flex items-center justify-center gap-3 text-[11px] font-bold">
      {items.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all duration-300 ${
                  done ? 'bg-arcade-sage text-arcade-dark' : active ? 'bg-arcade-champagne text-arcade-dark shadow-champagne-glow' : 'bg-arcade-surface border border-arcade-border text-slate-500'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </span>
              <span className={active || done ? 'text-white' : 'text-slate-500'}>{label}</span>
            </div>
            {i < items.length - 1 && <span className={`w-8 h-px ${done ? 'bg-arcade-sage' : 'bg-arcade-border'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
