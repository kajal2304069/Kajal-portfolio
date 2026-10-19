tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
          body: ['"DM Sans"', 'system-ui', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
        },
        colors: {
          ink: 'var(--ink)',
          panel: 'var(--panel)',
          line: 'var(--line)',
          fg: 'var(--fg)',
          muted: 'var(--muted)',
          amber: 'var(--amber)',
          teal: 'var(--teal)'
        }
      }
    }
  };
