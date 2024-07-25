"use client"
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";

const font=Poppins({
    subsets:["latin"],
    weight:["600"]
});

export const OrgSidebar=()=>{
    const searchParams=useSearchParams();
    const favorites=searchParams.get("favorites");
    return(
        <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
            <Link href="/">
                <div className="flex items-center gap-x-2">
                    <Image
                     src="/logo.svg"
                     alt="logo"
                     width={60}
                     height={60}
                    />
                    <span className={cn(
                        "font-semibold text-2xl",font.className
                    )}>
                        MiroClone
                    </span>
                </div>
            </Link>
            <OrganizationSwitcher
            appearance={{
                elements:{
                    rootBox:{
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        width:"100%",
                    },
                    organizationSwitcherTrigger:{
                        width:"100%",
                        padding:"6px",
                        justifyContent:"space-between",
                        borderRadius:"8px",
                        backgroundColor:"#FFF",
                        border:"1px solid #E5E7EB"
                    }
                },
            }} 
            hidePersonal
            />
            <div className="space-y-1 w-full">
                <Button
                variant={favorites?"ghost":"secondary"}
                asChild
                size="lg"
                className="font-normal justify-start w-full px-2"
                >
                    <Link href="/">
                        <LayoutDashboard className='h-4 w-4 mr-2' />
                        Team boards
                    </Link>
                </Button>

                <Button
                variant={favorites?"secondary":"ghost"}
                asChild
                size="lg"
                className="font-normal justify-start w-full px-2"
                >
                    <Link href={{
                        pathname:"/",
                        query:{favorites:true}
                    }}>
                        <Star className='h-4 w-4 mr-2' />
                        Favorite boards
                    </Link>
                </Button>
            </div>
        </div>
    );
};