"use client"

import { Button } from "@/components/ui/button";
import { api} from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";


import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const EmptyBoard=()=>{
    const {organization}=useOrganization();
    const router=useRouter();
    const {mutate,pending}=useApiMutation(api.board.create);
    const ClickEvent=()=>{
        if(!organization) return;
        mutate({
            orgId:organization.id,
            title:"title"
        })
        .then((id)=>{
            toast.success("Board created");
            router.push(`/board/${id}`);
        })
        .catch(()=>{
            toast.error("Board creation failed");
        })
    }
    return(
        <div className="h-full flex flex-col items-center justify-center">
            <Image
              src="/note.svg"
              alt="Empty"
              width={120}
              height={120}
            
            />
            <h2 className="text-2xl font-semibold mt-6">
                Create your first Board
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
                Start a creating a Board
            </p>
            <div className="mt-6">
                <Button disabled={pending} onClick={ClickEvent} size="lg">
                    Create Board
                </Button>
            </div>
        </div>
    );
};