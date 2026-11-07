import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Abu Dhabi Oasis & Metropolis | Web3 City Simulator',
  description:
    'Futuristic UAE capital city simulator with Web3.js integration, smart contracts, solar clean-tech, and authentic Abu Dhabi landmarks.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
