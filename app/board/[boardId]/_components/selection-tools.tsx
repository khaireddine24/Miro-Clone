"use client"

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import {memo} from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolsProps{
    camera:Camera,
    setLastUsedColor:(color:Color)=>void;
};

export const SelectionTools=memo((
    {camera,setLastUsedColor}:SelectionToolsProps
)=>{

    {/* Current Selection*/}
    const selection=useSelf((me)=>me.presence.selection);

    {/* Move to Back Function */}

    const moveToBack = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const arr = liveLayerIds.toImmutable();
    
        const selectedLayers = arr.filter(id => selection.includes(id));
        const unselectedLayers = arr.filter(id => !selection.includes(id));
        while (liveLayerIds.length > 0) {
            liveLayerIds.delete(0);
        }
        selectedLayers.forEach(id => liveLayerIds.push(id));
        unselectedLayers.forEach(id => liveLayerIds.push(id));
    }, [selection]);

    {/* Move to Front Function */}

    const moveToFront = useMutation(({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const arr = liveLayerIds.toImmutable();
    
        const selectedLayers = arr.filter(id => selection.includes(id));
        const unselectedLayers = arr.filter(id => !selection.includes(id));
    
        while (liveLayerIds.length > 0) {
            liveLayerIds.delete(0);
        }
        unselectedLayers.forEach(id => liveLayerIds.push(id));
        selectedLayers.forEach(id => liveLayerIds.push(id));
    }, [selection]);


    const setFill=useMutation((
        {storage},
        fill:Color
    )=>{
        const liveLayers=storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id)=>{
            liveLayers.get(id)?.set("fill",fill);
        })
    },[selection,setLastUsedColor]);

    const deleteLayers=useDeleteLayers();

    const selectionBounds=useSelectionBounds();
    if(!selectionBounds){return null;}

    const x=selectionBounds.width/2+selectionBounds.x+camera.x;
    const y=selectionBounds.y+camera.y;

    return(
        <div 
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{ transform: `translate(${x-100}px, ${y - 25}px)`,
            top: -80,}}
        
        >
            <ColorPicker
                onChange={setFill}
            />

            <div className="flex flex-col gap-y-0.5">
                <Hint label="Bring to Front">
                    <Button size="icon" variant="board" onClick={moveToFront}>
                        <BringToFront/>
                    </Button>
                </Hint>

                <Hint label="Send to back" side="bottom">
                    <Button size="icon" variant="board" onClick={moveToBack}>
                        <SendToBack/>
                    </Button>
                </Hint>

            </div>

            <div className="flex items-center pl-2 ml-2 border-1 border-neutral-200">
                <Hint label="Delete">
                    <Button
                        variant="board"
                        size="icon"
                        onClick={deleteLayers}
                    >
                        <Trash2/>
                    </Button>
                </Hint>
            </div>
        </div>
    );
});

SelectionTools.displayName="Selection Tools";