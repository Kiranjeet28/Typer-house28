export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-[80vw]">
          {children}
      </body>
    </html>
  );
}