import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { PronunciationDisplay } from '../../data/vocabulary.types';

interface Props {
  onBack: () => void;
}

const pronunciationOptions: { value: PronunciationDisplay; label: string; desc: string }[] = [
  { value: 'phonetic', label: 'Practical', desc: 'e.g. min-gah-LAH-bah' },
  { value: 'romanization', label: 'Romanization', desc: 'e.g. miṅgalā bā' },
  { value: 'both', label: 'Both', desc: 'Practical + romanization' },
];

export function SettingsScreen({ onBack }: Props) {
  const { pronunciationDisplay, setPronunciationDisplay, audioEnabled, toggleAudio, showBurmeseScript, toggleBurmeseScript } = useSettingsStore();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <button onClick={onBack} className="p-1.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      </div>

      <div className="flex flex-col gap-6 px-6">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Burmese script
          </p>
          <button
            onClick={toggleBurmeseScript}
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border-2 transition-all"
            style={{ background: 'var(--card-surface)', borderColor: 'var(--card-border)' }}
          >
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Show Burmese script</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {showBurmeseScript ? 'Showing glyphs (e.g. မင်္ဂလာပါ)' : 'Hidden — phonetic only'}
              </div>
            </div>
            <div
              className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
              style={{ background: showBurmeseScript ? 'var(--accent-correct)' : 'var(--card-border)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-all"
                style={{ background: '#fff', left: showBurmeseScript ? 'calc(100% - 20px)' : '4px' }}
              />
            </div>
          </button>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Pronunciation display
          </p>
          <div className="flex flex-col gap-2">
            {pronunciationOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPronunciationDisplay(opt.value)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl border-2 text-left transition-all"
                style={{
                  background: pronunciationDisplay === opt.value ? 'var(--card-border)' : 'var(--card-surface)',
                  borderColor: pronunciationDisplay === opt.value ? 'var(--accent-correct)' : 'var(--card-border)',
                }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{opt.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
                {pronunciationDisplay === opt.value && (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-correct)' }} />
                )}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Audio
          </p>
          <button
            onClick={toggleAudio}
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border-2 transition-all"
            style={{ background: 'var(--card-surface)', borderColor: 'var(--card-border)' }}
          >
            <div className="flex items-center gap-3">
              {audioEnabled ? <Volume2 size={20} color="var(--accent-correct)" /> : <VolumeX size={20} color="var(--text-muted)" />}
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Sound effects
              </span>
            </div>
            <div
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: audioEnabled ? 'var(--accent-correct)' : 'var(--card-border)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-all"
                style={{ background: '#fff', left: audioEnabled ? 'calc(100% - 20px)' : '4px' }}
              />
            </div>
          </button>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Add content
          </p>
          <div className="px-4 py-3 rounded-2xl border-2" style={{ background: 'var(--card-surface)', borderColor: 'var(--card-border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Drop images into <code className="px-1 rounded text-xs" style={{ background: 'var(--card-border)', color: 'var(--text-primary)' }}>public/images/categories/</code> and add entries to <code className="px-1 rounded text-xs" style={{ background: 'var(--card-border)', color: 'var(--text-primary)' }}>src/data/vocabulary.json</code>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
