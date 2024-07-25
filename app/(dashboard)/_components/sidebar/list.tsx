"use client"
import { useOrganizationList } from "@clerk/nextjs";
import { Item } from "./item";

export const List=()=>{
    //@ts-ignore
    const {userMemberships}=useOrganizationList({
        userMemberships:{
            infinite:true,
        }
    });
    if(!userMemberships.data?.length) return null;
    return(
        <ul>
            {userMemberships.data?.map((member:any)=>(
                <Item
                    key={member.organization.id}
                    id={member.organization.id}
                    name={member.organization.name}
                    imageUrl={member.organization.imageUrl}
                />
            
            ))}
        </ul>
    );
};