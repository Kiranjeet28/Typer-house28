export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="w-[80vw]">
          {children}
      </body>
    </html>
  );
}