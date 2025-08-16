"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { UserNav } from "./user-nav";
import { Search, Menu, X } from "lucide-react";
import { type User } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MainNavProps {
  user: User | null;
}

export function MainNav({ user }: MainNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-14 items-center justify-between">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center">
          <Logo width={120} height={120} showText={false} priority={true} />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href={user ? "/deals" : "/sign-in"}
            className="text-black/80 hover:text-black font-bold text-sm transition-colors"
          >
            Deals
          </Link>
          <Link 
            href={user ? "/categories" : "/sign-in"}
            className="text-black/80 hover:text-black font-bold text-sm transition-colors"
          >
            Categories
          </Link>
          <Link 
            href={user ? "/feedback" : "/sign-in"}
            className="text-black/80 hover:text-black font-bold text-sm transition-colors"
          >
            Feedback
          </Link>
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-72 h-9 pl-9 pr-4 bg-white border-2 border-black rounded-lg text-sm placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white font-medium"
          />
        </div>

        {/* Advertise */}
        <Button 
          variant="outline"
          size="sm"
          className="text-black border-black hover:bg-black hover:text-primary-foreground font-bold h-9 px-4 border-2 rounded-full hidden md:inline-flex"
          asChild
        >
          <Link href={user ? "/advertise" : "/sign-in"}>
            Advertise
          </Link>
        </Button>

        {user ? (
          <>
            <Button 
              variant="ghost"
              size="sm"
              className="text-black/80 hover:text-black hover:bg-white/20 font-bold h-9 px-6 rounded-full hidden md:inline-flex"
              asChild
            >
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
            <Button 
              size="sm"
              className="bg-black hover:bg-gray-800 text-primary-foreground font-bold h-9 px-6 rounded-full shadow-lg hidden md:inline-flex"
              asChild
            >
              <Link href="/dashboard/deals/new">
                Submit Deal
              </Link>
            </Button>
            <div className="hidden md:block">
              <UserNav user={user} />
            </div>
          </>
        ) : (
          <>
            <Button 
              variant="ghost"
              size="sm"
              className="text-black/80 hover:text-black hover:bg-white/20 font-bold h-9 px-6 rounded-full hidden md:inline-flex"
              asChild
            >
              <Link href="/sign-in">
                Log in
              </Link>
            </Button>
            <Button 
              size="sm"
              className="bg-black hover:bg-gray-800 text-primary-foreground font-bold h-9 px-6 rounded-full shadow-lg hidden md:inline-flex"
              asChild
            >
              <Link href="/sign-in">
                Get Access
              </Link>
            </Button>
          </>
        )}

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="px-6 py-4 flex flex-row items-center justify-between">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo width={120} height={120} showText={false} priority={true} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close mobile menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </SheetHeader>
              <div className="flex flex-col space-y-6 px-6 py-4">
                {user && (
                  <div>
                    <UserNav user={user} />
                  </div>
                )}
                <Link 
                  href={user ? "/deals" : "/sign-in"}
                  className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Deals
                </Link>
                <Link 
                  href={user ? "/categories" : "/sign-in"}
                  className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  href={user ? "/feedback" : "/sign-in"}
                  className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Feedback
                </Link>
                <Link 
                  href={user ? "/advertise" : "/sign-in"}
                  className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Advertise
                </Link>
                {user ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/deals/new"
                      className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Submit Deal
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/sign-in"
                      className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/sign-in"
                      className="block px-4 py-2 text-black/80 hover:text-black font-bold text-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Access
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}