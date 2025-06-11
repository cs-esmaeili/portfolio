import '@/style/globals.css';

export const metadata = {
  title: "Javad Esmaeili",
  description: "PORTFOLIO FOR Javad Esmaeili",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className=''>
      <body className="fixed inset-0">
        {children}
      </body>
    </html>
  );
}
