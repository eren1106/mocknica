import Link from "next/link";
import { Github } from "lucide-react";
import { config } from "../../lib/config";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: `${config.dashboardUrl}` },
    ],
    resources: [
      { label: "GitHub", href: "https://github.com/eren1106/mocknica" },
      { label: "Issues", href: "https://github.com/eren1106/mocknica/issues" },
      {
        label: "Contributing",
        href: "https://github.com/eren1106/mocknica#contribute",
      },
      { label: "Privacy Policy", href: "/policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    // company: [
    //   { label: "About", href: "#about" },
    //   { label: "Blog", href: "#blog" },
    //   { label: "Contact", href: "#contact" },
    // ],
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl">Mocknica</span> */}
              <BrandLogo size="lg" showBeta={false} />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Open-source mock API platform for modern development teams.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/eren1106/mocknica"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          {/* <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
