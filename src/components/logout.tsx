'use client';

import React from 'react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { signOut } from 'next-auth/react';
import { navigationMenuTriggerStyle } from './ui/navigation-menu';

const LogoutButton: React.FC = () => {
    return (
        <Dialog>
            <DialogTrigger className={navigationMenuTriggerStyle() + " text-sm hover:cursor-pointer"}>Log Out</DialogTrigger>
            <DialogContent className='w-60'>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        <Button type='submit' onClick={() => signOut()}>Yes</Button>
                        <DialogClose asChild>No</DialogClose>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutButton;