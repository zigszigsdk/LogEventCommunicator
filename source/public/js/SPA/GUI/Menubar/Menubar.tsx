import * as React from 'react';	
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, UpstreamEvent, EventPhases} from '../GUIElement';
import {DropdownMenu, DropdownMenuProps, DropdownMenuState, FocusTypes, Styles, DropdownMenuEvent, Child} from './DropdownMenu';
import * as $ from 'jquery';

const menuHeight = 18;

interface MenubarProps extends DropdownMenuProps {}
interface MenubarState extends DropdownMenuState {}
interface MenubarEvent extends DropdownMenuEvent {}

export class Menubar extends DropdownMenu<MenubarProps, MenubarState, MenubarEvent>
{
	static defaultProps: MenubarProps = 
		{ parent: null
		, offset: {left: 0, top: 0}
		, dynamicTypeName: "Menubar"
		};
	
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

	/*override*/ protected incrementStyles(child: Child, prevChild: Child, newStyles: Styles): Styles
	{
		newStyles.label.width = this.getWidth(child);

		if(prevChild === undefined)
			return newStyles;
		
		const prevChildWidth = this.getWidth(prevChild)
		newStyles.label.left += prevChildWidth;
		newStyles.submenu.left += prevChildWidth;
		
		return newStyles;
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