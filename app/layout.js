import "./globals.css";

export const metadata = {
  title: "Warkop Barockah Always — Ngopi, Makan, Santai",
  description: "Warkop premium dengan kopi single origin, WiFi ngebut, dan suasana nyaman.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}