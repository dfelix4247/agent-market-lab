export const metadata = {
  title: "Agent Market Lab",
  description: "Machine-native paid utilities for autonomous agents",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", margin: 0, background: "#0b0d10", color: "#e8edf2" }}>
        {children}
      </body>
    </html>
  );
}
