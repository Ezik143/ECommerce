import { SunIcon, MoonIcon } from '@heroicons/react/20/solid';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '0.375rem',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color var(--transition-fast)',
      }}
    >
      {isDark ? (
        <SunIcon style={{ width: '1.25rem', height: '1.25rem' }} />
      ) : (
        <MoonIcon style={{ width: '1.25rem', height: '1.25rem' }} />
      )}
    </button>
  );
}
