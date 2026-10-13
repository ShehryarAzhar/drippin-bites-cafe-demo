import type { Metadata, Viewport } from "next";
import { Anton, Figtree } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartHydration } from "@/components/cart/cart-hydration";
import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFeaturedCategory, menu } from "@/lib/menu";
import { cn } from "@/lib/utils";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const { name, tagline, area } = menu.restaurant;
const featured = getFeaturedCategory();

const defaultTitle = `${name} | ${tagline}`;
const description = `Order ${
  featured ? `${featured.name} Egyptian street food, ` : ""
}pizzas, burgers and more from ${name}, ${area}.`;

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: `%s | ${name}`,
  },
  description,
  openGraph: {
    title: defaultTitle,
    description,
    siteName: name,
    type: "website",
    locale: "en_PK",
  },
};

export const viewport: Viewport = {
  // Same value as --background in globals.css; this export cannot read CSS.
  themeColor: "#14100C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Keeps route changes instant now that html scrolls smoothly (globals.css).
      data-scroll-behavior="smooth"
      className={cn("dark h-full antialiased font-sans", anton.variable, figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to content
        </a>
        <SiteHeader />
        {/* The only <main>; pages render their content inside it. */}
        <main id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <SiteFooter />
        <MobileCartBar />
        <CartDrawer />
        <CartHydration />
      </body>
    </html>
  );
}
