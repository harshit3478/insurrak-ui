import React from 'react';

export const FormHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="bg-gradient-to-r from-[#0E3B5E] to-[#40E0D0] px-8 py-10 rounded-2xl text-white shadow-sm mb-8 relative overflow-hidden">
     {/* Noise/Texture Overlay Effect */}
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    <div className="relative z-10">
      <h1 className="text-3xl font-semibold font-display mb-2">{title}</h1>
      <p className="text-blue-50 font-light opacity-90">{subtitle}</p>
    </div>
  </div>
);

export const SuccessHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="bg-gradient-to-r from-[#2F9E44] to-[#40C057] px-8 py-10 rounded-2xl text-white shadow-sm mb-8 relative overflow-hidden">
    <div className="relative z-10">
      <h1 className="text-3xl font-semibold font-display mb-2">{title}</h1>
      <p className="text-green-50 font-light opacity-90">{subtitle}</p>
    </div>
  </div>
);

export const FormSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`mb-8 ${className || ''}`}>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  fullWidth?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({ label, fullWidth, className, ...props }) => (
  <div className={`space-y-2 ${fullWidth ? 'w-full' : ''} ${className || ''}`}>
    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </label>
    <input
      className="w-full px-4 py-3 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0E3B5E] focus:border-[#0E3B5E] transition-all disabled:bg-gray-50 disabled:text-gray-400"
      {...props}
    />
  </div>
);

export const Stepper: React.FC<{ steps: number; currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-4 mb-8 px-2">
      {Array.from({ length: steps }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        return (
          <React.Fragment key={i}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${isActive || isCompleted ? 'bg-[#0B1727] text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {stepNum}
            </div>
            {i < steps - 1 && (
              <div className="w-12 h-px border-t border-dashed border-gray-300" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};