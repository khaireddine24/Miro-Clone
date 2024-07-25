"use client"

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { useState,useCallback, useMemo, useEffect } from "react";
import { Camera, CanvasMode, CanvasState, Color, LayerType,Point,XYWH,Side } from "@/types/canvas";
import { useHistory,useCanUndo,useCanRedo,useMutation, useStorage, useOthersMapped, useSelf } from "@/liveblocks.config";
import { CursorsPresence } from "./cursors-presence";
import { colorToCss, connectionIdToColor, findIntersectinglayersWithRectangle, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import {nanoid} from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

interface CanvasProps{
    boardId:string;
}

const Max_Layers=100;

export const Canvas=({boardId,}:CanvasProps)=>{
    useSelectionBounds();
    const history=useHistory();
    const canUndo=useCanUndo();
    const canRedo=useCanRedo();
    const LayerIds=useStorage((root)=>root.layerIds);
    const pencilDraft=useSelf((me)=>me.presence.pencilDraft);
    const [camera,setCamera]=useState<Camera>({x:0,y:0});


    
    const updateSelectionNet=useMutation(({storage,setMyPresence},current:Point,origin:Point,)=>{
        const layers=storage.get("layers").toImmutable();
        setCanvasState({
            mode:CanvasMode.SelectionNet,
            origin,
            current
        });
        const ids=findIntersectinglayersWithRectangle(LayerIds,layers,origin,current);
        setMyPresence({selection:ids});

    },[LayerIds]);

    const onResizeHandlePointerDown=useCallback((
        corner:Side,
        initialBounds:XYWH,
    )=>{
        history.pause();
        setCanvasState({
            mode:CanvasMode.Resizing,
            initialBounds,
            corner
        })
    },[history]);

    const [lastUsedColor,setLastUsedColor]=useState<Color>({
        r:255,
        g:255,
        b:255,
    });

    const insertLayer=useMutation((
        {storage,setMyPresence},
        LayerType:LayerType.Ellipse | LayerType.Note | LayerType.Rectangle | LayerType.Text,
        position:Point,
    )=>{
        const liveLayers=storage.get("layers");
        if(liveLayers.size>=Max_Layers){return;}
        const liveLayerIds=storage.get("layerIds");
        const layerId=nanoid();
        const layer=new LiveObject({
            type:LayerType,
            x:position.x,
            y:position.y,
            height:100,
            width:100,
            fill:lastUsedColor

        });
        liveLayerIds.push(layerId);
        liveLayers.set(layerId,layer);
        setMyPresence({selection:[layerId]},{addToHistory:true});
        setCanvasState({mode:CanvasMode.None});
    },[lastUsedColor]);

    const [canvasState,setCanvasState]=useState<CanvasState>({
        mode:CanvasMode.None
    });

    const translateSelectedLayers=useMutation(({storage,self},point:Point)=>{
        if(canvasState.mode!==CanvasMode.Translating){
            return ;
        }

        const offset={
            x:point.x-canvasState.current.x,
            y:point.y-canvasState.current.y,
        };
        const liveLayers=storage.get("layers");
        for(const id of self.presence.selection){
            const layer=liveLayers.get(id);
            if(layer){
                layer.update({
                    x:layer.get("x")+offset.x,
                    y:layer.get("y")+offset.y,
                })
            }
        }
        setCanvasState({mode:CanvasMode.Translating,current:point});
    },[canvasState])


    const continueDrawing=useMutation(({self,setMyPresence},point:Point,e:React.PointerEvent)=>{
        const {pencilDraft}=self.presence;
        if(canvasState.mode!==CanvasMode.Pencil || e.buttons!==1 || pencilDraft==null){
            return;
        }
        setMyPresence({
            cursor:point,
            pencilDraft:
                pencilDraft.length===1 && pencilDraft[0][0]===point.x &&
                pencilDraft[0][1]===point.y ? pencilDraft:
                [...pencilDraft,[point.x,point.y,e.pressure]]
        });
    },[canvasState.mode]);
    
    const startDrawing=useMutation(({setMyPresence},point:Point,pressure:number)=>{
        setMyPresence({
            pencilDraft:[[point.x,point.y,pressure]],
            penColor:lastUsedColor
        })
    },[lastUsedColor]);

    const resizeSelectedLayer=useMutation(({storage,self},point:Point)=>{
        if(canvasState.mode!==CanvasMode.Resizing){return;}
        
        const bounds=resizeBounds(
            canvasState.initialBounds,
            canvasState.corner,
            point,
        );

        const liveLayers=storage.get("layers");
        const layer=liveLayers.get(self.presence.selection[0]);
        if(layer){
            layer.update(bounds);
        }

    },[canvasState]);

    const onPointerDown=useCallback((
        e:React.PointerEvent,
    )=>{
        const point=pointerEventToCanvasPoint(e,camera);
        if(canvasState.mode===CanvasMode.Inserting){return;}
        if(canvasState.mode===CanvasMode.Pencil){
            startDrawing(point,e.pressure);
            return;
        }

        setCanvasState({origin:point,mode:CanvasMode.Pressing});

    },[camera,canvasState.mode,setCanvasState]);

    const startMultiSelection=useCallback((current:Point,origin:Point)=>{
        if(Math.abs(current.x-origin.x)+Math.abs(current.y-origin.y)>5){
            setCanvasState({mode:CanvasMode.SelectionNet,origin,current});
        }
    },[]);

    const insertPath=useMutation(({storage,self,setMyPresence})=>{
        const liveLayers=storage.get("layers");
        const {pencilDraft}=self.presence;
        if(pencilDraft==null || pencilDraft.length<2 || liveLayers.size>=Max_Layers){
            setMyPresence({pencilDraft:null});
            return;
        }

        const id=nanoid();
        liveLayers.set(
            id,
            new LiveObject(penPointsToPathLayer(
                pencilDraft,
                lastUsedColor
            ))
        );

        const liveLayerIds=storage.get("layerIds");
        liveLayerIds.push(id);
        setMyPresence({pencilDraft:null});
        setCanvasState({mode:CanvasMode.Pencil});

    },[lastUsedColor]);

    

    

    const onPointerMove=useMutation(({setMyPresence},e:React.PointerEvent)=>{
        e.preventDefault();
        const current=pointerEventToCanvasPoint(e,camera);

        if(canvasState.mode===CanvasMode.Pressing){
            startMultiSelection(current,canvasState.origin);
        }
        else if(canvasState.mode===CanvasMode.SelectionNet){
            updateSelectionNet(current,canvasState.origin);
        }

        else if(canvasState.mode===CanvasMode.Translating){
            translateSelectedLayers(current);
        }

        else if(canvasState.mode===CanvasMode.Resizing){
            resizeSelectedLayer(current);
        }

        else if(canvasState.mode===CanvasMode.Pencil){
            continueDrawing(current,e);
        }

        setMyPresence({cursor:current})
    },[camera,canvasState,resizeSelectedLayer,translateSelectedLayers,startMultiSelection,updateSelectionNet,continueDrawing]);

    const onPointerleave=useMutation(({setMyPresence})=>{
        setMyPresence({cursor:null});
    },[]);

    const onWheel=useCallback((e:React.WheelEvent)=>{
        setCamera((camera)=>({
            x:camera.x-e.deltaX,
            y:camera.y-e.deltaY,
        }))
    },[canvasState]);

    const unselectedLayers=useMutation(({self,setMyPresence})=>{
        if(self.presence.selection.length>0){
            setMyPresence({selection:[]},{addToHistory:true});
        }
    },[]);
    

    const onPointerUp=useMutation((
        {},
        e
    )=>{
        const point=pointerEventToCanvasPoint(e,camera);
        if(canvasState.mode===CanvasMode.None || canvasState.mode===CanvasMode.Pressing){
            unselectedLayers();
            setCanvasState({
                mode:CanvasMode.None
            });
        }

        else if(canvasState.mode===CanvasMode.Pencil){
            insertPath();
        }

        else if(canvasState.mode===CanvasMode.Inserting){
            //@ts-ignore
            insertLayer(canvasState.layerType,point);
        }
        else{
            setCanvasState({mode:CanvasMode.None});
        }
        history.resume();
    },[camera,canvasState,history,insertLayer,unselectedLayers,setCanvasState,insertPath]);

    const selections=useOthersMapped((other)=>other.presence.selection);

    const layerIdsToColorSelection=useMemo(()=>{
        const layerIdsToColor:Record<string,string>= {};
        for(const user of selections){
            const [connectionId,selection]=user;
            for(const layerId of selection){
                layerIdsToColor[layerId]=connectionIdToColor(connectionId);
            }
        }
        return layerIdsToColor;
    },[selections]);

    const onLayerPointerDown=useMutation((
        {self,setMyPresence},
        e:React.PointerEvent,
        layerId:string
    )=>{
        if(canvasState.mode===CanvasMode.Pencil || canvasState.mode===CanvasMode.Inserting){
            return;
        }

        history.pause();
        e.stopPropagation();

        const point=pointerEventToCanvasPoint(e,camera);
        if(!self.presence.selection.includes(layerId)){
            setMyPresence({selection:[layerId]},{addToHistory:true});
        }

        setCanvasState({mode:CanvasMode.Translating,current:point});
    },[setCanvasState,camera,history,canvasState.mode]);

    const deleteLayers=useDeleteLayers();

    useEffect(()=>{
        function onKeyDown(e:KeyboardEvent){
            switch(e.key){
                case "Backspace":
                    deleteLayers();
                    break;
                case "z":{
                    if(e.ctrlKey || e.metaKey){
                        if(e.shiftKey){
                            history.redo();
                        }
                        else{
                            history.undo();
                        }
                        break;
                    }
                }
                
            }
        }
        document.addEventListener("keydown",onKeyDown);

        return()=>{
            document.removeEventListener("keydown",onKeyDown);
        }
    },[deleteLayers,history]);

    

    
    return(
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId}/>
            <Participants/>
            <Toolbar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canRedo={canRedo}
                canUndo={canUndo}
                undo={history.undo}
                redo={history.redo}
            
            />

            <SelectionTools
                camera={camera}
                setLastUsedColor={setLastUsedColor}
            
            />
            <svg
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerDown={onPointerDown}
                onPointerLeave={onPointerleave}
                onPointerUp={onPointerUp}
            >
                <g
                    style={{transform:`translate(${camera.x}px,${camera.y}px)`}}
                >
                    {LayerIds.map((layerId)=>(
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                    />

                    {canvasState.mode===CanvasMode.SelectionNet && canvasState.current!=null &&(
                        <rect
                            className="fill-blue-500/5 stroke-blue-500 stroke-1"
                            x={Math.min(canvasState.origin.x,canvasState.current.x)}
                            y={Math.min(canvasState.origin.y,canvasState.current.y)}
                            width={Math.abs(canvasState.origin.x-canvasState.current.x)}
                            height={Math.abs(canvasState.origin.y-canvasState.current.y)}
                        />
                    )}
                    <CursorsPresence/>
                    {pencilDraft!=null && pencilDraft.length>0 &&(
                        <Path
                            points={pencilDraft}
                            fill={colorToCss(lastUsedColor)}
                            x={0}
                            y={0}

                        />
                    )}
                </g>
            </svg>
        </main>
    );
};