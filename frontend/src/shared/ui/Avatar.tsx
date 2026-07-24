// ── Avatar ────────────────────────────────────────────────
// Generates initials + deterministic color from name

const avatarColors = [
  'bg-blue-700', 'bg-emerald-700', 'bg-violet-700',
  'bg-amber-700', 'bg-rose-700', 'bg-teal-700',
];

function colorFromName(name: string): string {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = colorFromName(name);
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';
  return (
    <div className={`${sizeClass} rounded-full ${color} flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}
