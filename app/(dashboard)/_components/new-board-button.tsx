"use client"

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewBoardButtonProps{
    orgId:string;
    disabled?:boolean;
}

export const NewBoardButton=({orgId,disabled}:NewBoardButtonProps)=>{
    const {mutate,pending}=useApiMutation(api.board.create);
    const router=useRouter();
    const ClickEvent=()=>{
        mutate({
            orgId,
            title:"title"
        })
        .then((id)=>{
            toast.success("Board created");
            router.push(`/board/${id}`);
        })
        .catch(()=>{
            toast.error("Failed to create Board");
        })
    }

    return(
        <button 
        disabled={disabled || pending}
        onClick={ClickEvent}
        className={cn(
            "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
            (disabled || pending) && "opacity-75 hover:bg-blue-600 cursor-not-allowed"
        )}>
            <div/>
            <Plus className="h-12 w-12 text-white stroke-1"/>
            <p className="text-sm text-white font-light">
                New Board
            </p>
        </button>
    );
};
