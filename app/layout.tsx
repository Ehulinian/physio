import { Inter } from 'next/font/google';
import { Providers } from './providers';

import './globals.css';

const inter = Inter({
	subsets: ['cyrillic'],
	variable: '--font-inter',
	weight: ['400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="uk">
			<head>
				<link data-rh="true" rel="icon" href="/logo.png" />
			</head>
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
