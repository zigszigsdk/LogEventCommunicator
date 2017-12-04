import * as React from 'react';	
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, UpstreamEvent, EventPhases} from '../GUIElement';
import {DropdownMenu, DropdownMenuProps, DropdownMenuState, FocusTypes, MenuItemDefinition, Styles, DropdownMenuEvent} from './DropdownMenu';
import * as $ from 'jquery';

const menuHeight = 18;

interface MenubarProps extends DropdownMenuProps {}
interface MenubarState extends DropdownMenuState {}
interface MenubarEvent extends DropdownMenuEvent {}

export class Menubar extends DropdownMenu<MenubarProps, MenubarState, MenubarEvent>
{
	protected typeName = "Menubar";
	
	constructor(props: MenubarProps)
	{
		super(props);
		this.state = 
			{ focusType: FocusTypes.none
			, focusAt: -1 
			};
	}

	/*override*/ protected getStyles(): Styles
	{
		return {
			  label: 
				{ left: this.props.offset.left
				, top: this.props.offset.top
				}
			, submenu:
				{ left: this.props.offset.left
				, top: this.props.offset.top + menuHeight
				}
			};
	}

	/*override*/ protected incrementStyles(menuItemDef: MenuItemDefinition, newStyles: Styles): Styles
	{
		const width = this.getWidth(menuItemDef)
		newStyles.label.left += width;
		newStyles.submenu.left += width;
		return newStyles;
	}

	protected getWidth(menuItem: MenuItemDefinition): number
	{
		const renderObject = 
			$('<span>' + menuItem.label + '</span>')
			.css({'visibility': 'hidden'})
			.appendTo($('body'));
		
		const width = renderObject.width();
		renderObject.remove();
		
		return width;
	}

	/*override*/ protected onMouseEnter(id: Id, event: MenubarEvent): MenubarEvent
	{
		if(event.phase !== EventPhases.ready)
			return event;

		const focusType = this.state.focusType === FocusTypes.child 
			? FocusTypes.child
			: FocusTypes.self;

		this.setState(
			{ focusAt: id.index
			, focusType: focusType
			}
		);
		event.phase = EventPhases.consumed;
		return event;
	}

	/*override*/ protected onMouseLeave(id: Id, event: MenubarEvent): MenubarEvent
	{
		return event; //get sticky focus unlike super
	}

}