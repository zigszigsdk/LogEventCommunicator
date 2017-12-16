import * as React from "react";
import {GUIElementUpstream, UpstreamEvent, DownstreamEvent, GUIElementDownstream, GUIElement, Id} from "./GUIElement";
import {KeyboardListener} from "./KeyboardListener";

export abstract class GUIRoot extends React.Component<{}, {}> 
	implements GUIElementUpstream, GUIElementDownstream
{
	protected abstract content: JSX.Element;
	
	public abstract recieveUpstreamEvent(id: Id, event: UpstreamEvent): UpstreamEvent;
	public abstract recieveDownstreamEvent(event: DownstreamEvent): boolean;

	public render(): JSX.Element
	{
		return(
			<span>
				<KeyboardListener passEventsTo={this}/>
				{this.content}
			</span>);
	}
}