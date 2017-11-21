import * as React from 'react';
import {KeyMemory} from '../KeyMemory';

export interface DropdownItemProps
{
	label: string //underscore before hotkey, eg "_File" for F
	hotkey?: string //only active when parent has focus
	enabled?: boolean //assumed true if omitted
	submenu?: Array<DropdownItemProps>
	clickAction?: () => void //ignored if submenu is included
} 

interface DropdownItemState 
{
	open: boolean
}

export class DropdownItem extends React.Component<DropdownItemProps, DropdownItemState>
{
	public static makeTag(props: DropdownItemProps): JSX.Element
	{
		return <DropdownItem
				key={props.label}
				hotkey={props.hotkey}
				label={props.label}
				enabled={props.enabled}
				submenu={props.submenu}
				clickAction={props.clickAction}
				/>
	}

	constructor(props)
	{
		//if no submenu
		//	listen to mouseclick
		//	listen to hotkey derrived from props.label
		super(props);
		this.state = {open: false}
	}

	public render(): JSX.Element
	{
		const keyMemory = KeyMemory.getInstance(); 
		return (
			<div>
				<a href='#'
				 onClick={this.onClick}
				 onKeyDown={keyMemory.onKeyDown}
				 onKeyUp={keyMemory.onKeyUp}
				>
					{this.props.label}
				</a>
				<div>
					{this.props.submenu && this.state.open ? 
						this.props.submenu.map(
							(props: DropdownItemProps) =>
							{	return DropdownItem.makeTag(props) 							}
						)
					: null }
				</div>
			</div>
		);
	}

	public onClick = (event) =>
	{
		event.preventDefault();
		
		if(this.props.submenu)
		{
			this.setState(
			{
				open: !this.state.open
			});
			return;
		}
		
		if(!this.props.clickAction)
			return;

		this.props.clickAction();
	}
}
