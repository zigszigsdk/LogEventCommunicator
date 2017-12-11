import * as React from 'react';	
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, MouseEventTriggerTypes, UpstreamEvent} from './GUIElement';

interface MouseListenerProps extends GUIProps{}
interface MouseListenerState extends GUIState{}

export class MouseListener 
	extends GUIElement<MouseListenerProps, MouseListenerState, UpstreamEvent>
{
	static defaultProps: MouseListenerProps = 
		{ parent: null
		, offset: {left: 0, top: 0}
		};
	
	public render(): JSX.Element
	{
		let listeners = {};
		for (let key in MouseEventTriggerTypes)
			listeners[MouseEventTriggerTypes[key]] =
				(event)=>this.createMouseEvent(
						this.props.id
					,	event
					,	key as MouseEventTriggerTypes
					);

		return <span {...listeners}>{this.props.children}</span>;
	}
}