/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    safelist: [
        // Simple lightning glow utility classes
        'btn-lightning', 'btn-lightning-ai', 'btn-lightning-subtle',
        'card-lightning', 'card-lightning-ai', 'card-lightning-subtle',
        'section-lightning', 'section-lightning-ai',
        'glow-ring', 'glow-ring-ai',
        'input-lightning', 'input-lightning-ai',
        'border-lightning', 'border-lightning-ai',
        'hover-lift', 'hover-glow',
        // Responsive utilities
        'text-responsive-xs', 'text-responsive-sm', 'text-responsive-base', 'text-responsive-lg',
        'text-responsive-xl', 'text-responsive-2xl', 'text-responsive-3xl', 'text-responsive-4xl',
        'space-responsive-1', 'space-responsive-2', 'space-responsive-3', 'space-responsive-4', 'space-responsive-6', 'space-responsive-8',
        'p-responsive-2', 'p-responsive-3', 'p-responsive-4', 'p-responsive-6', 'p-responsive-8',
        'px-responsive-2', 'px-responsive-3', 'px-responsive-4', 'px-responsive-6', 'px-responsive-8',
        'py-responsive-2', 'py-responsive-3', 'py-responsive-4', 'py-responsive-6', 'py-responsive-8',
        'gap-responsive-1', 'gap-responsive-2', 'gap-responsive-3', 'gap-responsive-4', 'gap-responsive-6', 'gap-responsive-8',
        'grid-responsive-1', 'grid-responsive-2', 'grid-responsive-3', 'grid-responsive-4', 'grid-responsive-5', 'grid-responsive-6',
        'sm:grid-responsive-1', 'sm:grid-responsive-2', 'sm:grid-responsive-3', 'sm:grid-responsive-4',
        'md:grid-responsive-1', 'md:grid-responsive-2', 'md:grid-responsive-3', 'md:grid-responsive-4', 'md:grid-responsive-5', 'md:grid-responsive-6',
        'lg:grid-responsive-1', 'lg:grid-responsive-2', 'lg:grid-responsive-3', 'lg:grid-responsive-4', 'lg:grid-responsive-5', 'lg:grid-responsive-6',
        'safe-top', 'safe-bottom', 'safe-left', 'safe-right', 'safe-all',
        'container-responsive',
        'flex-responsive', 'flex-col-responsive',
        'sm:flex-row-responsive', 'md:flex-row-responsive', 'lg:flex-row-responsive',
        'focus-visible-ring', 'select-none',
    ],
    theme: {
        extend: {
            colors: {
                /* ── Theme-aware colors (respect CSS variables) ── */
                "background":               "var(--color-bg)",
                "surface":                  "var(--color-surface)",
                "surface-container":        "var(--color-surface)",
                "surface-container-low":    "var(--color-surface-low)",
                "surface-container-high":   "var(--color-surface-high)",
                "surface-container-highest":"var(--color-surface-highest)",
                "surface-container-lowest": "var(--color-surface-lowest)",
                "surface-dim":              "var(--color-bg)",
                "surface-bright":           "var(--color-surface-highest)",
                "surface-variant":          "var(--color-surface-highest)",
                "primary":                  "var(--color-primary)",
                "on-primary":               "var(--color-on-primary)",
                "on-background":            "var(--color-text)",
                "on-surface":               "var(--color-text)",
                "on-surface-variant":       "var(--color-text-muted)",
                "outline":                  "var(--color-text-subtle)",
                "outline-variant":          "var(--color-border)",
                "accent-purple":            "var(--color-accent)",

                /* ── Static semantic colors ── */
                "error":                    "#ef4444",
                "on-error":                 "#ffffff",
                "error-container":          "#fca5a5",
                "on-error-container":       "#7f1d1d",
                "secondary":                "#94a3b8",
                "on-secondary":             "#ffffff",
                "secondary-container":      "var(--color-surface-high)",
                "on-secondary-container":   "var(--color-text-muted)",
                "tertiary":                 "var(--color-primary)",
                "on-tertiary":              "var(--color-on-primary)",
                "tertiary-container":       "var(--color-surface-high)",
                "inverse-surface":          "var(--color-primary)",
                "inverse-on-surface":       "var(--color-on-primary)",
                "inverse-primary":          "var(--color-bg)",
                "primary-container":        "var(--color-surface-high)",
                "on-primary-container":     "var(--color-text-muted)",
                "primary-fixed":            "var(--color-surface-high)",
                "primary-fixed-dim":        "var(--color-surface-highest)",
                "on-primary-fixed":         "var(--color-text)",
                "on-primary-fixed-variant": "var(--color-text-muted)",
                "surface-tint":             "var(--color-accent)",

                /* ── Shadcn button fix — primary-foreground must map to on-primary ── */
                "primary-foreground": "var(--color-on-primary)",

                /* ── Shadcn compatibility ── */
                foreground:     "var(--color-text)",
                card: {
                    DEFAULT:    "var(--color-surface)",
                    foreground: "var(--color-text)",
                },
                popover: {
                    DEFAULT:    "var(--color-surface)",
                    foreground: "var(--color-text)",
                },
                muted: {
                    DEFAULT:    "var(--color-surface-high)",
                    foreground: "var(--color-text-muted)",
                },
                accent: {
                    DEFAULT:    "var(--color-surface-high)",
                    foreground: "var(--color-primary)",
                },
                destructive: {
                    DEFAULT:    "#ef4444",
                    foreground: "#ffffff",
                },
                border: "var(--color-border)",
                input:  "var(--color-surface-high)",
                ring:   "var(--color-primary)",
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                sm:  "0.375rem",
                md:  "0.75rem",
                lg:  "1rem",
                xl:  "1.25rem",
                "2xl": "1.5rem",
                full: "9999px"
            },
            spacing: {
                "xs":  "4px",
                "sm":  "8px",
                "md":  "16px",
                "lg":  "24px",
                "xl":  "32px",
                "xxl": "48px",
                "margin-desktop": "48px",
                "margin-mobile":  "16px",
            },
            fontFamily: {
                "display":  ["Plus Jakarta Sans", "sans-serif"],
                "headline": ["Plus Jakarta Sans", "sans-serif"],
                sans: ["Plus Jakarta Sans", "sans-serif"],
                inter: ["Plus Jakarta Sans", "sans-serif"],
            },
            fontSize: {
                /* ── Compact scale — slightly smaller than Tailwind defaults ── */
                "xs":    ["10.5px", { lineHeight: "15px" }],
                "sm":    ["12px",   { lineHeight: "17px" }],
                "base":  ["13.5px", { lineHeight: "20px" }],
                "lg":    ["15px",   { lineHeight: "22px" }],
                "xl":    ["17px",   { lineHeight: "24px", letterSpacing: "-0.015em" }],
                "2xl":   ["20px",   { lineHeight: "27px", letterSpacing: "-0.025em" }],
                "3xl":   ["23px",   { lineHeight: "30px", letterSpacing: "-0.03em" }],
                "4xl":   ["28px",   { lineHeight: "36px", letterSpacing: "-0.035em" }],
                "5xl":   ["34px",   { lineHeight: "42px", letterSpacing: "-0.04em" }],
                "6xl":   ["42px",   { lineHeight: "50px", letterSpacing: "-0.045em" }],
                /* ── Custom semantic tokens ── */
                "display-lg":        ["42px",  { lineHeight: "50px",  letterSpacing: "-0.04em", fontWeight: "700" }],
                "display-lg-mobile": ["28px",  { lineHeight: "34px",  letterSpacing: "-0.03em", fontWeight: "700" }],
                "headline-lg":       ["24px",  { lineHeight: "32px",  letterSpacing: "-0.025em", fontWeight: "600" }],
                "headline-md":       ["19px",  { lineHeight: "27px",  fontWeight: "600" }],
                "body-lg":           ["15px",  { lineHeight: "24px",  fontWeight: "400" }],
                "body-md":           ["13.5px",{ lineHeight: "21px",  fontWeight: "400" }],
                "body-sm":           ["12px",  { lineHeight: "18px",  fontWeight: "400" }],
                "label-md":          ["11px",  { lineHeight: "15px",  letterSpacing: "0.04em", fontWeight: "500" }],
                "label-sm":          ["9.5px", { lineHeight: "13px",  letterSpacing: "0.06em", fontWeight: "600" }],
            },
            boxShadow: {
                'sm':  'var(--shadow-sm)',
                'md':  'var(--shadow-md)',
                'lg':  'var(--shadow-lg)',
                'glow': '0 0 20px var(--color-accent-light)',
                'lightning': '0 0 0 1px var(--glow-primary), 0 0 20px var(--glow-secondary), 0 0 40px var(--glow-tertiary)',
                'lightning-strong': '0 0 0 1px var(--glow-primary), 0 0 32px var(--glow-secondary), 0 0 64px var(--glow-tertiary)',
                'lightning-ai': '0 0 0 1px var(--glow-ai-primary), 0 0 20px var(--glow-ai-secondary), 0 0 40px var(--glow-ai-tertiary)',
                'lightning-ai-strong': '0 0 0 1px var(--glow-ai-primary), 0 0 32px var(--glow-ai-secondary), 0 0 64px var(--glow-ai-tertiary)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to:   { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to:   { height: '0' }
                },
                'slide-up': {
                    from: { transform: 'translateY(8px)', opacity: '0' },
                    to:   { transform: 'translateY(0)',   opacity: '1' }
                },
                'lightning-pulse': {
                    '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.02)' }
                },
                'lightning-shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' }
                },
                'aura-rotate': {
                    '0%': { transform: 'rotate(0deg) scale(1)' },
                    '100%': { transform: 'rotate(360deg) scale(1)' }
                },
                'aura-pulse-ring': {
                    '0%': { transform: 'scale(0.95)', opacity: '0.4' },
                    '50%': { transform: 'scale(1.05)', opacity: '0.15' },
                    '100%': { transform: 'scale(0.95)', opacity: '0.4' }
                },
                'lightning-crackle': {
                    '0%, 100%': { opacity: '0', transform: 'scaleX(0.3)' },
                    '5%, 15%, 25%, 35%': { opacity: '1', transform: 'scaleX(1)' },
                    '10%, 20%, 30%, 40%': { opacity: '0.3', transform: 'scaleX(0.6)' }
                },
                'glow-breathe': {
                    '0%, 100%': { boxShadow: '0 0 20px var(--glow-primary), 0 0 40px var(--glow-secondary), 0 0 60px var(--glow-tertiary)' },
                    '50%': { boxShadow: '0 0 32px var(--glow-primary), 0 0 56px var(--glow-secondary), 0 0 80px var(--glow-tertiary)' }
                },
                'glow-breathe-ai': {
                    '0%, 100%': { boxShadow: '0 0 20px var(--glow-ai-primary), 0 0 40px var(--glow-ai-secondary), 0 0 60px var(--glow-ai-tertiary)' },
                    '50%': { boxShadow: '0 0 32px var(--glow-ai-primary), 0 0 56px var(--glow-ai-secondary), 0 0 80px var(--glow-ai-tertiary)' }
                },
                'lightning-border': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                },
                'aura-gradient-flow': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '33%': { backgroundPosition: '50% 100%' },
                    '66%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                },
                'subtle-float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' }
                },
                'subtle-float-x': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(3px)' }
                },
                'glow-ring-expand': {
                    '0%': { transform: 'scale(1)', opacity: '0.5' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' }
                },
                'lightning-scan': {
                    '0%': { transform: 'translateX(-100%) skewX(-15deg)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translateX(200%) skewX(-15deg)', opacity: '0' }
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up':   'accordion-up 0.2s ease-out',
                'slide-up':       'slide-up 0.25s ease-out',
                'lightning-pulse': 'lightning-pulse 3s ease-in-out infinite',
                'lightning-shimmer': 'lightning-shimmer 2s linear infinite',
                'aura-rotate': 'aura-rotate 4s linear infinite',
                'aura-pulse-ring': 'aura-pulse-ring 2s ease-in-out infinite',
                'lightning-crackle': 'lightning-crackle 0.5s ease-in-out',
                'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
                'glow-breathe-ai': 'glow-breathe-ai 3s ease-in-out infinite',
                'lightning-border': 'lightning-border 2s linear infinite',
                'aura-gradient-flow': 'aura-gradient-flow 4s ease-in-out infinite',
                'subtle-float': 'subtle-float 4s ease-in-out infinite',
                'subtle-float-x': 'subtle-float-x 3s ease-in-out infinite',
                'glow-ring-expand': 'glow-ring-expand 1.5s ease-out infinite',
                'lightning-scan': 'lightning-scan 1.5s ease-in-out infinite',
            },
            backgroundSize: {
                '300%': '300% 300%',
                '400%': '400% 400%',
            },
            backgroundPosition: {
                '0%': '0% 50%',
                '50%': '50% 100%',
                '100%': '100% 50%',
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
}