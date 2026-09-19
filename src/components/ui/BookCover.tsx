import { useState } from 'react';
import { getSubjectIcon } from '../../utils/helpers';

function getCoverGradient(subject: string): string {
  const gradients: Record<string, string> = {
    Matematika: 'from-blue-600 via-indigo-700 to-purple-800',
    Fizika: 'from-violet-600 via-fuchsia-700 to-pink-800',
    Kimyo: 'from-emerald-600 via-teal-700 to-cyan-800',
    Biologiya: 'from-green-600 via-emerald-700 to-teal-800',
    Informatika: 'from-slate-700 via-slate-800 to-gray-900',
    Tarix: 'from-amber-600 via-orange-700 to-red-800',
    Geografiya: 'from-sky-600 via-blue-700 to-indigo-800',
    'Ona tili': 'from-rose-600 via-pink-700 to-fuchsia-800',
    Adabiyot: 'from-indigo-600 via-blue-700 to-cyan-800',
    'Ingliz tili': 'from-red-600 via-rose-700 to-pink-800',
    'Rus tili': 'from-blue-700 via-blue-600 to-cyan-700',
  };
  return gradients[subject] ?? 'from-primary-600 via-blue-700 to-emerald-800';
}

interface BookCoverProps {
  subject: string;
  title: string;
  author: string;
  coverImage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<BookCoverProps['size']>, string> = {
  sm: 'h-44',
  md: 'h-52',
  lg: 'aspect-[3/4] w-full',
};

export default function BookCover({
  subject,
  title,
  author,
  coverImage,
  className = '',
  size = 'md',
}: BookCoverProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = coverImage && !imgError;

  if (showImage) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-700 ${sizeClasses[size]} ${className}`}>
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${getCoverGradient(subject)} ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
        <span className="text-4xl drop-shadow-lg mb-3">{getSubjectIcon(subject)}</span>
        <h3 className="text-sm font-bold leading-tight text-white drop-shadow-md line-clamp-3">
          {title}
        </h3>
        <p className="mt-1.5 text-[11px] font-medium text-white/70 line-clamp-1">
          {author}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
      <div className="absolute bottom-0 left-0 top-0 w-[6px] bg-gradient-to-b from-white/20 to-transparent" />
    </div>
  );
}