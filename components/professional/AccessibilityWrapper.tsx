'use client';

import { FC, ReactNode, useEffect } from 'react';

interface AccessibilityWrapperProps {
  children: ReactNode;
  compliance?: 'WCAG2.1-AA' | 'WCAG2.1-AAA';
  skipToContent?: boolean;
  announceRegionChanges?: boolean;
  className?: string;
}

export const AccessibilityWrapper: FC<AccessibilityWrapperProps> = ({
  children,
  compliance = 'WCAG2.1-AA',
  skipToContent = true,
  announceRegionChanges = true,
  className = ''
}) => {
  useEffect(() => {
    // Initialize accessibility features
    if (announceRegionChanges) {
      // Create live region for dynamic content announcements
      const liveRegion = document.createElement('div');
      liveRegion.id = 'wrei-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';

      if (!document.getElementById('wrei-live-region')) {
        document.body.appendChild(liveRegion);
      }
    }

    // Set up focus management for keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab trap for modal dialogs (if any are open)
      // Skip link activation
      if (event.key === 'Tab' && skipToContent) {
        // Handle skip links navigation
      }

      // Escape key handling for modals
      if (event.key === 'Escape') {
        // Close any open modals or dropdowns
        const openModals = document.querySelectorAll('[data-modal-open="true"]');
        openModals.forEach(modal => {
          modal.setAttribute('data-modal-open', 'false');
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [announceRegionChanges, skipToContent]);

  return (
    <div
      className={`accessibility-wrapper ${className}`}
      data-compliance={compliance}
    >
      {skipToContent && (
        <SkipToContent />
      )}

      {/* Main application content */}
      <div role="application" aria-label="WREI Trading Platform">
        {children}
      </div>

      {/* Screen reader only announcements */}
      <div
        id="wrei-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

const SkipToContent: FC = () => {
  const handleSkipToMain = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    const mainContent = document.getElementById('main-content') ||
                       document.querySelector('main') ||
                       document.querySelector('[role="main"]');

    if (mainContent) {
      mainContent.focus();
      // Add temporary tabindex if element is not naturally focusable
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
    }
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        onKeyDown={(e) => e.key === 'Enter' && handleSkipToMain(e)}
        style={{
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          background: '#000',
          color: '#fff',
          padding: '8px 16px',
          textDecoration: 'none',
          zIndex: 9999,
          transition: 'all 0.2s ease-in-out'
        }}
        onFocus={(e) => {
          // Show skip link when focused
          e.target.style.left = '16px';
          e.target.style.top = '16px';
          e.target.style.width = 'auto';
          e.target.style.height = 'auto';
        }}
        onBlur={(e) => {
          // Hide skip link when focus is lost
          e.target.style.left = '-10000px';
          e.target.style.top = 'auto';
          e.target.style.width = '1px';
          e.target.style.height = '1px';
        }}
      >
        Skip to main content
      </a>
    </div>
  );
};

// Utility function to announce content changes to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = document.getElementById('wrei-live-region');
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;

    // Clear the message after a short delay to allow for re-announcement of the same message
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
};

// Color contrast validation utilities for WCAG compliance
export const validateColorContrast = (foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} => {
  // Convert hex colors to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getRelativeLuminance = (rgb: { r: number; g: number; b: number }) => {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(value => {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return { ratio: 0, passesAA: false, passesAAA: false };
  }

  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);

  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) /
                   (Math.min(fgLuminance, bgLuminance) + 0.05);

  return {
    ratio: Math.round(contrast * 100) / 100,
    passesAA: contrast >= 4.5,
    passesAAA: contrast >= 7.0
  };
};