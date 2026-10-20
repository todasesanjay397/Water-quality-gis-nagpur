export const metadata = {
  title: 'Nagpur Water Quality Monitoring',
  description: 'Comprehensive fluoride & nitrate contamination tracking across Nagpur district',
  icons: {
    icon: '/fno3.webp',
    shortcut: '/fno3.webp',
    apple: '/fno3.webp',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
