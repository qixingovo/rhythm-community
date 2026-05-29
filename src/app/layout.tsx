import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rhythm Community | 音游社区',
    template: '%s | Rhythm Community',
  },
  description: '专业的音游社区平台，提供AI陪练、成绩管理、社区交流等功能',
  keywords: [
    '音游',
    'Rhythm',
    '社区',
    'AI陪练',
    'Arcaea',
    'Phigros',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
