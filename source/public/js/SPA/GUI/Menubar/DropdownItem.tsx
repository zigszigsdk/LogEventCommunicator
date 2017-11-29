import * as React from 'react';
import * as $ from 'jquery';
import {KeyMemory} from '../KeyMemory';

const borderWidth = 1;

export interface DropdownItemProps
{
	label: string //underscore before hotkey, eg "_File" for F
	hotkey?: string //only active when parent has focus
	enabled?: boolean //assumed true if omitted
	submenu?: Array<DropdownItemProps>
	clickAction?: () => void //ignored if submenu is included
	offset?: [number, number]
	widestSibling?: number
	childOfMenubar?: boolean
	isFirstChild?: boolean
	isLastChild?: boolean
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
				offset={props.offset || [0, 0]}
				widestSibling={props.widestSibling || this.getWidth(props)}
				childOfMenubar={props.childOfMenubar}
				isFirstChild={props.isFirstChild}
				isLastChild={props.isLastChild}
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

	public static getWidth(props): number
	{
		const renderObject = 
			$('<span>' + props.label + '</span>')
			.css({'visibility': 'hidden'})
			.appendTo($('body'));
		
		const width = renderObject.width();
		renderObject.remove();
		
		return width;
	}

	public render(): JSX.Element
	{
		const offsetStyle: React.CSSProperties = 
			{ left: this.props.offset[0]
			, top: this.props.offset[1]
			, position: "absolute"
			};

		const ownStyle: React.CSSProperties = 
			{ width: this.props.widestSibling
			, borderRightStyle: "solid"
			, borderLeftStyle: "solid"
			, borderTopStyle: this.props.isFirstChild ? "solid" : "none"
			, borderBottomStyle: this.props.isLastChild ? "solid" : "none"
			, whiteSpace: "nowrap"
			, position: "absolute"
			, borderWidth: borderWidth
			};

		let widestChild = 0;
		for(let index in this.props.submenu)
		{
			const width = DropdownItem.getWidth(this.props.submenu[index]);
			if(width > widestChild)
				widestChild = width;
		}

		const keyMemory = KeyMemory.getInstance(); 
		
		const xOffset = 
			this.props.childOfMenubar
			? 0 
			: this.props.widestSibling + borderWidth;

		let yOffset = this.props.childOfMenubar ? 16 : 0;

		return <span style={offsetStyle}>
			<span
				className={(this.props.childOfMenubar ? "MenuBar" : "DropdownItem")
					+ " unselectable"}
				style={ownStyle}
				onClick={this.onClick}
				onKeyDown={keyMemory.onKeyDown}
				onKeyUp={keyMemory.onKeyUp}
			>
				{this.props.label}
			</span>
			{this.props.submenu && this.state.open ? 
				this.props.submenu.map(
					(props: DropdownItemProps, index: number) =>
					{
						props.offset = [xOffset, yOffset];
						props.widestSibling = widestChild;
						props.isFirstChild = index === 0;
						props.isLastChild = index === this.props.submenu.length-1;

						yOffset += 20;
						
						return DropdownItem.makeTag(props);
					}
				)
			: null}
		</span>;
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
