import { Hint } from "@/components/hint";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";

interface AvatarProps{
    src?: string;
    name?:string;
    fallback?:string;
    borderColor?:string;
}

export const UserAvatar=({src,name,fallback,borderColor}:AvatarProps)=>{
    return(
        <Hint label={name || "khaireddine"} side="bottom" sideOffset={18}>
            <Avatar className="h-8 w-8 border-2" style={{borderColor}}>
                <AvatarImage src={src} />
                <AvatarFallback className="text-xs font-semibold">
                    {fallback}
                </AvatarFallback>

            </Avatar>
        </Hint>
    );

};