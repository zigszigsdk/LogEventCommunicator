import * as React from 'react';
import {DynamicTypedProps} from "TypedReactChildren"

export enum MouseEventTriggerTypes 
{	onClick="onClick"
,	onContextMenu="onContextMenu"
,	onDoubleClick="onDoubleClick"
,	onDrag="onDrag"
,	onDragEnd="onDragEnd"
,	onDragEnter="onDragEnter"
,	onDragExit="onDragExit"
,	onDragLeave="onDragLeave"
,	onDragOver="onDragOver"
,	onDragStart="onDragStart"
,	onDrop="onDrop"
,	onMouseDown="onMouseDown"
,	onMouseEnter="onMouseEnter"
,	onMouseLeave="onMouseLeave"
,	onMouseMove="onMouseMove"
,	onMouseOut="onMouseOut"
,	onMouseOver="onMouseOut"
,	onMouseUp="onMouseUp"
};

export type MouseEvent = React.MouseEvent<HTMLElement>;

export interface Id
{
	type?: string|number
	index: number
}

export enum EventPhases 
	{ request
	, ready
	, consumed
	};

export interface UpstreamEvent
{	
	mouseEvent: MouseEvent
	trigger: MouseEventTriggerTypes
	phase: EventPhases
}

export interface GUIElementUpstream
{
	recieveUpstreamEvent: (Id, UpstreamEvent) => UpstreamEvent
}

export interface GUIElementDownstream
{
	attemptConsumeDownstreamEvent: (KeyboardEventInit) => boolean
}

export interface Offset
{
	left: number
	top: number
}

export interface GUIProps extends DynamicTypedProps
{
	parent?: GUIElementUpstream
	id?: Id
	offset?: Offset
}

export interface GUIState{}

export abstract class GUIElement<P extends GUIProps, S extends GUIState, 
	E extends UpstreamEvent> extends React.Component<P, S>
	implements GUIElementUpstream
{
	static defaultProps: GUIProps = 
		{ parent: null
		, offset: {left: 0, top: 0}
		, dynamicTypeName: "GUIElement"
		};

	constructor(props)
	{
		super(props);

	}

	public recieveUpstreamEvent(childId: Id, event: UpstreamEvent): UpstreamEvent
	{
		this.exposeUpstreamEvent(childId, event)
		return this.sendUpstreamEvent(event);
	}

	protected createMouseEvent(childId: Id, mouseEvent: MouseEvent, 
		trigger: MouseEventTriggerTypes): void
	{
		mouseEvent.stopPropagation();
		mouseEvent.preventDefault();
		
		let event: UpstreamEvent = 
			{ mouseEvent: mouseEvent
			, trigger: trigger
			, phase: EventPhases.request
			};

		event = this.sendUpstreamEvent(event);

		if(event.phase === EventPhases.consumed)
			return;

		event.phase = EventPhases.ready;

		event = this.exposeUpstreamEvent(childId, event);

		this.sendUpstreamEvent(event);
	}

	protected sendUpstreamEvent(event: UpstreamEvent): UpstreamEvent
	{
		return this.props.parent.recieveUpstreamEvent(this.getId(), event);
	}

	protected onClick(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onContextMenu(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDoubleClick(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDrag(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragEnd(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragEnter(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragExit(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragLeave(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragOver(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDragStart(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onDrop(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseDown(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseEnter(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseLeave(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseMove(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseOut(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseOver(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 
	protected onMouseUp(childId: Id, event: UpstreamEvent): UpstreamEvent {return event;} 

	private exposeUpstreamEvent(childId: Id, event: UpstreamEvent): UpstreamEvent
	{
		const types = MouseEventTriggerTypes;
		switch(event.trigger)
		{
			case types.onClick: return this.onClick(childId, event);
			case types.onContextMenu: return this.onContextMenu(childId, event);
			case types.onDoubleClick: return this.onDoubleClick(childId, event);
			case types.onDrag: return this.onDrag(childId, event);
			case types.onDragEnd: return this.onDragEnd(childId, event);
			case types.onDragEnter: return this.onDragEnter(childId, event);
			case types.onDragExit: return this.onDragExit(childId, event);
			case types.onDragLeave: return this.onDragLeave(childId, event);
			case types.onDragOver: return this.onDragOver(childId, event);
			case types.onDragStart: return this.onDragStart(childId, event);
			case types.onDrop: return this.onDrop(childId, event);
			case types.onMouseDown: return this.onMouseDown(childId, event);
			case types.onMouseEnter: return this.onMouseEnter(childId, event);
			case types.onMouseLeave: return this.onMouseLeave(childId, event);
			case types.onMouseMove: return this.onMouseMove(childId, event);
			case types.onMouseOut: return this.onMouseOut(childId, event);
			case types.onMouseOver: return this.onMouseOver(childId, event);
			case types.onMouseUp: return this.onMouseUp(childId, event);
		}
		return event;
	}

	private getId(): Id
	{
		if(this.props.id === undefined)
			return {type: this.props.dynamicTypeName, index: -1}
		
		if(this.props.id.type === undefined)
			return {type: this.props.dynamicTypeName, index: this.props.id.index}

		return this.props.id;
	}

	private getOffset(): Offset
	{
		return this.props.offset || {left: 0, top: 0};
	}
}