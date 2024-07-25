"use client"

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionsProps{
    children:React.ReactNode;
    side?:DropdownMenuContentProps["side"];
    sideOffset?:DropdownMenuContentProps["sideOffset"];
    id:string;
    title:string;
}

export const Actions=({
    children,
    side,
    sideOffset,
    id,
    title
}:ActionsProps)=>{
    const {mutate,pending}=useApiMutation(api.board.remove);
    const {onOpen}=useRenameModal();

    const OnCopyLink=()=>{
        navigator.clipboard.writeText(`${window.location.origin}/board/${id}`,)
        .then(()=>toast.success("Link Copied"))
        .catch(()=>toast.error("Failed to copy link"));
    }

    const OnDelete=()=>{
        mutate({id})
        .then(()=>toast.success("Board Deleted"))
        .catch(()=>toast.error("Failed to delete board"));
    };

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onClick={(e)=>e.stopPropagation()}
              side={side}
              sideOffset={sideOffset}
              className="w-60"
                >
                <DropdownMenuItem className="p-3 cursor-pointer" onClick={OnCopyLink}>
                    <Link2 className="w-4 h-4 mr-2"/>
                    Copy Board Link
                </DropdownMenuItem>

                <DropdownMenuItem className="p-3 cursor-pointer" onClick={()=>{onOpen(id,title)}}>
                    <Pencil className="w-4 h-4 mr-2"/>
                    Rename
                </DropdownMenuItem>

                <ConfirmModal
                    header="Delete board?"
                    description="Are you sure you want to delete this board?"
                    disabled={pending}
                    onConfirm={OnDelete}
                    >
                    <Button variant="ghost" className="p-3 cursor-pointer text-sm w-full font-normal justify-start">
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Delete
                    </Button>
                </ConfirmModal>

            </DropdownMenuContent>
        </DropdownMenu>
    );
};