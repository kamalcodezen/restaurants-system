'use client';
import { ThemeProvider } from '@gravity-ui/uikit';

export default function GravityProvider({ children }) {
  return (
    <ThemeProvider theme="light">
      {children}
    </ThemeProvider>
  );
}
