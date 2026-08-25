'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "首页" },
    { href: "/analyze", label: "优化简历" },
    { href: "/about", label: "关于我们" },
];

export default function Header() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // 路由变化时关闭移动端菜单
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // 初始化主题
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme("dark");
        }
    }, []);

    // 切换主题
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const linkClass = (href: string) =>
        `transition-colors hover:text-foreground/80 ${
            pathname === href ? "text-primary font-semibold" : "text-foreground"
        }`;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            ResumeVibe
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={linkClass(link.href)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="ml-2"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                            <span className="sr-only">切换主题</span>
                        </Button>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* 移动端菜单按钮 */}
                        <Button
                            variant="ghost"
                            className="px-0"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-expanded={mobileOpen}
                            aria-label="切换导航菜单"
                        >
                            {mobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <nav className="flex items-center">
                        <Button asChild>
                            <Link href="/analyze">开始优化简历</Link>
                        </Button>
                    </nav>
                </div>
            </div>

            {/* 移动端展开菜单 */}
            {mobileOpen && (
                <div className="md:hidden border-t">
                    <nav className="container flex flex-col py-2 text-sm font-medium">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2 py-3 transition-colors hover:bg-muted ${
                                    pathname === link.href ? "text-primary font-semibold" : "text-foreground"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="flex items-center gap-2 px-2 py-3 text-left transition-colors hover:bg-muted"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                            <span className="text-foreground">
                                {theme === "dark" ? "切换为浅色模式" : "切换为深色模式"}
                            </span>
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
