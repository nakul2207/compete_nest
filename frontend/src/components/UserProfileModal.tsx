import { useState } from 'react'
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { logout } from '@/redux/slice/authSlice'
import { useNavigate } from 'react-router-dom'

export function UserProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout())
    navigate("/auth")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Your account details are below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Name:</span>
            <span className="col-span-3">{user?.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Email:</span>
            <span className="col-span-3">{user?.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Role:</span>
            <span className="col-span-3">{user?.role}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleLogout} variant="destructive">Logout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

