import * as React from "react";
import {GUIElementDownstream, KeyTrigger, EventPhases} from "./GUIElement";
import * as $ from 'jquery';

interface Props
{
	passEventsTo: GUIElementDownstream
}

interface State{}

export class KeyboardListener extends React.Component<Props, State>
{
	private inputRef: any;
	private KeycodesDownToKeyname: {[keyCode: number]: string} = {};
	private lastKeycodeDown: number;

	public render(): JSX.Element
	{
		window.onblur = this.onWindowFocusLoss;
		return (
			<div style={ {overflow: "hidden", width: 0} }>
				<input
				autoFocus
				style={ {opacity: 0, filter:"alpha(opacity=0)"} }
				onKeyDown={(e)=>this.onKeyDown(e)}
				onKeyUp={(e)=>this.onKeyUp(e)}
				ref={(x)=>this.inputRef=x} 
				onBlur={(e)=>this.onBlur(e)}
				></input>
				<input
				style={ {opacity: 0, filter:"alpha(opacity=0)"} }
				></input>
			</div>
		);
	}

	onBlur = (event: any) =>
	{
		setTimeout(()=>this.inputRef.focus(), 20);
	}

	onKeyDown = (event: React.KeyboardEvent<any>): void =>
	{
		if(this.KeycodesDownToKeyname[event.keyCode])
			return;

		this.lastKeycodeDown = event.keyCode;

		this.sendDownstreamEvent(event, KeyTrigger.DOWN);

		this.KeycodesDownToKeyname[event.keyCode] = event.key;
	}

	onKeyUp = (event: React.KeyboardEvent<any>): void =>
	{
		if(!this.KeycodesDownToKeyname[event.keyCode])
			return;

		delete this.KeycodesDownToKeyname[event.keyCode];

		this.sendDownstreamEvent(event, KeyTrigger.UP);
	}

	onWindowFocusLoss = () =>
	{
		const keyCodes = Object.keys(this.KeycodesDownToKeyname);
		for(let keyCodeIndex in keyCodes)
		{
			this.props.passEventsTo.recieveDownstreamEvent(
				{	key: keyCodes[keyCodeIndex]
				,	code: this.KeycodesDownToKeyname[keyCodes[keyCodeIndex]]
				,	trigger: KeyTrigger.WINDOW_FOCUS_LOSS
				,	modifiers: {}
				}
			);
		}

		this.KeycodesDownToKeyname = {};
	}

	sendDownstreamEvent(event: React.KeyboardEvent<any>, trigger: KeyTrigger)
	{
		const modifiersDownCount: number = 
			(this.KeycodesDownToKeyname["alt"] ? 1 : 0) +
			(this.KeycodesDownToKeyname["shift"] ? 1 : 0) +
			(this.KeycodesDownToKeyname["ctrl"] ? 1 : 0);

		const keysDownCount: number = Object.keys(this.KeycodesDownToKeyname).length;

		this.props.passEventsTo.recieveDownstreamEvent(
			{ key: event.key 
			, code: event.keyCode
			, trigger: trigger
			, phase: EventPhases.ready
			, modifiers: 
				{ alt: event.altKey
				, ctrl: event.ctrlKey
				, shift: event.shiftKey
				, alone: keysDownCount === modifiersDownCount
				, uninterrupted: event.keyCode === this.lastKeycodeDown
				}
			}
		);
	}
}
