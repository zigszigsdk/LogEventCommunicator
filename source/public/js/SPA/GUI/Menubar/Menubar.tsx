import * as React from 'react';	
import {DropdownItemProps, DropdownItem} from './DropdownItem';
import {KeyMemory} from '../KeyMemory';

export interface MenubarProps
{
	hotkey: string //eg "alt"
	menubarItems: Array<DropdownItemProps>
	offset: [number, number]
}

interface MenubarState 
{
	thisOrChildHasFocus: boolean
}

export class Menubar extends React.Component<MenubarProps, MenubarState>
{
	public static makeTag(props: MenubarProps): JSX.Element
	{
		return <Menubar
				hotkey={props.hotkey} 
				menubarItems={props.menubarItems}
				offset={props.offset}
				/>
	}

	constructor(props: MenubarProps)
	{
		super(props);
		this.state = {thisOrChildHasFocus: false};
		let keyMemory = KeyMemory.getInstance();
		keyMemory.subscribeOnUp(props.hotkey, this.recieveFocus);
	}

	private recieveFocus = (event: KeyboardEventInit) =>
	{
		console.log(event.key + " focus!");
	}

	public render(): JSX.Element
	{
		const ownStyle = 
			{ left: this.props.offset[0]
			, top: this.props.offset[1]
			};

		let childOffsetX = 0;
		let children = this.props.menubarItems.map(
			(props: DropdownItemProps, index: number) =>
			{
				props.offset = [childOffsetX, 0];
				props.childOfMenubar = true;

				childOffsetX += DropdownItem.getWidth(props);
				
				return DropdownItem.makeTag(props);
			}
		);

		return <span style={ownStyle}>
			{children}
		</span>;
	}
}