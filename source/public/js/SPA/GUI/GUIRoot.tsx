import * as React from "react";
import {GUIElementUpstream, UpstreamEvent, DownstreamEvent, GUIElementDownstream, GUIElement, Id} from "./GUIElement";
import {KeyboardListener} from "./KeyboardListener";

interface GUIRootState {};
interface GUIRootProps {};

export abstract class GUIRoot<P extends GUIRootProps, S extends GUIRootState> 
	extends React.Component<P, S>
	implements GUIElementUpstream, GUIElementDownstream
{
	protected abstract getContent(): JSX.Element;
	
	public abstract recieveUpstreamEvent(id: Id, event: UpstreamEvent): UpstreamEvent;
	public abstract recieveDownstreamEvent(event: DownstreamEvent): DownstreamEvent;

	public render(): JSX.Element
	{
		return(
			<span>
				<KeyboardListener passEventsTo={this}/>
				{this.getContent()}
			</span>);
	}
}