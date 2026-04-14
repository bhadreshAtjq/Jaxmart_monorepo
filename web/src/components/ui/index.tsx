// src/components/ui/index.tsx
import { clsx } from 'clsx';
import { FaSpinner } from 'react-icons/fa6';
import React from 'react';

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className, variant = 'rect' }: { className?: string; variant?: 'rect' | 'circle' | 'text' }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200/80',
        variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded h-4 w-full' : 'rounded-2xl',
        className
      )}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <Card padding={false} className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="text" className="w-full h-6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <Skeleton variant="text" className="w-1/4 h-5" />
        </div>
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <Skeleton variant="text" className="w-1/2 h-4" />
      <Skeleton variant="text" className="w-3/4 h-8" />
    </Card>
  );
}

// ── Container ───────────────────────────────────────────────────────────────
export function Container({ children, className, size = 'xl' }: { children: React.ReactNode; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };
  return <div className={clsx('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}>{children}</div>;
}

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', loading, icon, fullWidth,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-xl transition-all duration-200 focus-ring disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] outline-none';
  const variants: Record<string, string> = {
    primary: 'bg-jax-blue text-white hover:bg-jax-dark hover:shadow-lg hover:shadow-jax-blue/20',
    secondary: 'bg-jax-teal/10 text-jax-blue border border-jax-teal/20 hover:bg-jax-teal/20',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-jax-dark shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20',
    outline: 'bg-white text-jax-blue border border-jax-blue/20 hover:border-jax-blue hover:bg-jax-light',
    dark: 'bg-jax-dark text-white hover:bg-black hover:shadow-lg hover:shadow-jax-dark/20',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <FaSpinner className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  ACTIVE:       'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  COMPLETED:    'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  CREATED:      'bg-amber-50 text-amber-700 border border-amber-200/60',
  DISPUTED:     'bg-red-50 text-red-700 border border-red-200/60',
  PENDING:      'bg-gray-100 text-gray-600 border border-gray-200/60',
  SUBMITTED:    'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
  RELEASED:     'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  OPEN:         'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  AWARDED:      'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
  CLOSED:       'bg-gray-100 text-gray-500 border border-gray-200/60',
  WON:          'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  LOST:         'bg-gray-100 text-gray-500 border border-gray-200/60',
  SHORTLISTED:  'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
  VERIFIED:     'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  REJECTED:     'bg-red-50 text-red-700 border border-red-200/60',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  FEATURED:     'bg-amber-50 text-amber-700 border border-amber-200/60',
  PRODUCT:      'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
  SERVICE:      'bg-jax-dark/5 text-jax-dark border border-jax-dark/10',
  BUYER:        'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
  SELLER:       'bg-jax-dark/5 text-jax-dark border border-jax-dark/10',
  BOTH:         'bg-amber-50 text-amber-700 border border-amber-200/60',
  INDIVIDUAL:   'bg-gray-100 text-gray-600 border border-gray-200/60',
  BUSINESS:     'bg-jax-teal/10 text-jax-blue border border-jax-teal/20',
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Awaiting payment',
  UNDER_REVIEW: 'Under review',
  PARTIAL_RELEASED: 'Partial released',
  FULLY_RELEASED: 'Fully released',
};

export function Badge({ status, label, className }: { status?: string; label?: string; className?: string }) {
  const key = status?.toUpperCase() ?? '';
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border', STATUS_BADGE[key] ?? 'bg-gray-100 text-gray-600 border border-gray-200/60', className)}>
      {label ?? STATUS_LABELS[key] ?? key.replace(/_/g, ' ')}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md', className }: {
  name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string;
}) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  const sizes: Record<string, string> = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
  };
  if (src) return <img src={src} alt={name} className={clsx('rounded-xl object-cover ring-2 ring-white', sizes[size], className)} />;
  return (
    <div className={clsx(
      'rounded-xl bg-jax-teal/10 text-jax-blue font-heading font-bold flex items-center justify-center flex-shrink-0 border border-jax-teal/20',
      sizes[size], className
    )}>
      {initials}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <FaSpinner className={clsx('animate-spin text-jax-blue', className ?? 'h-5 w-5')} />;
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, onClick, padding = true, variant = 'white' }: {
  children: React.ReactNode; className?: string; onClick?: () => void; padding?: boolean; variant?: 'white' | 'dark' | 'glass';
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border transition-all duration-300',
        variant === 'white' && 'bg-white border-gray-200/60',
        variant === 'dark' && 'bg-jax-dark border-white/10 text-white',
        variant === 'glass' && 'bg-white/40 backdrop-blur-md border-white/20',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:border-jax-blue/30 hover:-translate-y-1',
        padding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, hint, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-jax-blue transition-colors">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'input-field',
            icon && 'pl-11',
            error && 'border-red-400 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        className={clsx(
          'input-field resize-none min-h-[120px]',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select
          className={clsx(
            'input-field appearance-none cursor-pointer pr-10',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, trend }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode; trend?: string;
}) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity group-hover:scale-110 duration-500">
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-xs font-heading font-bold text-gray-500 uppercase tracking-widest leading-none mb-3">{label}</p>
        <div className="flex items-baseline gap-2">
          {value && <p className="text-3xl font-heading font-black text-jax-dark tracking-tighter">{value}</p>}
          {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{trend}</span>}
        </div>
        {sub && <p className="text-[11px] text-jax-blue/80 font-medium mt-2">{sub}</p>}
      </div>
    </Card>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, subtitle }: { title: string; action?: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl font-heading font-black text-jax-dark tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
      {icon && <div className="mb-6 text-gray-300 scale-150">{icon}</div>}
      <h3 className="text-lg font-heading font-bold text-jax-dark">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

// ── TrustScore ────────────────────────────────────────────────────────────────
export function TrustScore({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-1000', color)} style={{ width: `${score}%` }} />
      </div>
      <span className={clsx('text-[11px] font-heading font-black uppercase tracking-wider', textColor)}>{score}% TRUST</span>
    </div>
  );
}

// ── PageLoader ────────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl border-4 border-jax-blue/10 animate-pulse" />
          <Spinner className="h-6 w-6 absolute inset-0 m-auto text-jax-blue" />
        </div>
        <p className="text-[10px] font-heading font-bold text-jax-blue uppercase tracking-[0.2em] animate-pulse">Loading Platform</p>
      </div>
    </div>
  );
}
