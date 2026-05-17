import { useSettingsStore } from '../../store/settingsStore';

interface Props {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  forceShow?: boolean;
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export function BurmeseText({ text, className = '', size = 'md', forceShow = false }: Props) {
  const showBurmeseScript = useSettingsStore((s) => s.showBurmeseScript);
  if (!forceShow && !showBurmeseScript) return null;
  return (
    <span className={`burmese font-bold leading-relaxed ${sizeMap[size]} ${className}`}>
      {text}
    </span>
  );
}
