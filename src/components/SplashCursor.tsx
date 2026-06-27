import React from 'react';

/**
 * The previous version ran a full-screen WebGL fluid simulation on every page.
 * It was expensive on mobile devices and kept the GPU active continuously.
 * Keep this component as a no-op so existing imports stay compatible.
 */
export default function SplashCursor(): React.ReactElement | null {
  return null;
}
