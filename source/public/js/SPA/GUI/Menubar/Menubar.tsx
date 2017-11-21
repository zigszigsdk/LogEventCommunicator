import * as React from 'react';	
import {DropdownItemProps, DropdownItem} from './DropdownItem';
import {KeyMemory} from '../KeyMemory';

export interface MenubarProps
{
	hotkey: string //eg "alt"
	menubarItems: Array<DropdownItemProps>
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
		return <div>
			{this.props.menubarItems.map(
				(props: DropdownItemProps) =>
				{	return DropdownItem.makeTag(props)}
			)}
		</div>;
	}
}