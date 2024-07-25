"use client"
import { OrganizationSwitcher, useOrganization, UserButton } from "@clerk/nextjs";
import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";

export const Navbar=()=>{
    const {organization} =useOrganization();
    return(
        <div className="flex items-center gap-x-4 p-5 ">
            <div className="hidden lg:flex-1 lg:flex">
                <SearchInput/>
            </div>
            <div className="block lg:hidden flex-1">
            <OrganizationSwitcher
            appearance={{
                elements:{
                    rootBox:{
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        width:"100%",
                        maxWidth:"376px"
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
            </div>
            {organization &&(
                <InviteButton />
            )}
            <UserButton/>
        </div>
    );
};