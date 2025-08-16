"use client"

import { User } from "@supabase/supabase-js";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LayoutDashboard, Settings, LogOut } from "lucide-react"
import { signOut } from "@/lib/client/auth"
import { useState } from "react"

interface UserNavProps {
  user: any
}

export function UserNav({ user }: UserNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?'

  const userName = user?.user_metadata?.full_name || user?.email || 'User'

  return (
    <Dialog open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {user?.user_metadata?.avatar_url ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.user_metadata.avatar_url}
              alt={userName}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              {userInitials}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {user?.user_metadata?.avatar_url ? (
              <img
                className="h-8 w-8 rounded-full"
                src={user.user_metadata.avatar_url}
                alt={userName}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {userInitials}
              </div>
            )}
            <span>{userName}</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            {user?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
            onClick={() => setIsDropdownOpen(false)}
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
            onClick={() => setIsDropdownOpen(false)}
          >
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <div className="border-t pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
