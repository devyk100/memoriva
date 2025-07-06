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
            <DialogTrigger className={navigationMenuTriggerStyle() + " hover:cursor-pointer"}>Log Out</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        <p>You will be logged out after pressing "Yes"</p>
                        <div className='w-full flex justify-between flex-wrap p-2'>
                            <Button type='submit' className='w-[48%]' onClick={() => signOut()}>Yes</Button>
                            <DialogClose asChild className='w-[48%]'><Button className='w-[48%]'>No</Button></DialogClose>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutButton;