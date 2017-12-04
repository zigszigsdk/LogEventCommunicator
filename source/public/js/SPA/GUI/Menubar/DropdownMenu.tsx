import * as React from 'react';	
import {KeyMemory} from '../KeyMemory';
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, UpstreamEvent, EventPhases} from '../GUIElement';

import * as $ from 'jquery';
import {MouseListener} from '../MouseListener';

export type Style = React.CSSProperties;

export interface Styles 
{
	label: Style
	submenu: Offset
}

export interface MenuItemDefinition
{
	label: string
	hotkey: string
	action?: ()=>void
	submenu?: Array<MenuItemDefinition>
}


export interface DropdownMenuProps extends GUIProps
{
	subMenu: Array<MenuItemDefinition>
}

export enum FocusTypes {none, self, child};
export enum ChildTypes {label, submenu};

export interface DropdownMenuState extends GUIState
{
	focusType: FocusTypes
	focusAt: number 
}

export interface DropdownMenuEvent extends UpstreamEvent
{
	closeParents: boolean
}

const labelHeight = 18;

export class DropdownMenu<P extends DropdownMenuProps, S extends DropdownMenuState, E extends DropdownMenuEvent>
	extends GUIElement<DropdownMenuProps, DropdownMenuState, DropdownMenuEvent>
{
	protected typeName = "DropdownMenu";

	constructor(props: DropdownMenuProps)
	{
		super(props);
		this.state = 
			{ focusType: FocusTypes.none
			, focusAt: -1 
			};
	}

	public render(): JSX.Element
	{
		let menuItems: Array<JSX.Element> = new Array();
		let submenus: Array<JSX.Element> = new Array();

		let styles = this.getStyles();

		this.props.subMenu.map((menuItemDef: MenuItemDefinition
								, index: number) =>
		{
			const last: boolean = index === this.props.subMenu.length-1;

			
			const className: string = this.typeName + 
							(this.state.focusAt === index ? "--highlight" : "");

			menuItems.push(
				<MouseListener 
					parent={this}
					key={index}
					id={{index: index, type:ChildTypes.label}}
					offset={this.props.offset}
				>
					<span
						className={className}
						style={styles.label}
					>
						{menuItemDef.label}
					</span>
				</MouseListener>
			);
			
			if(menuItemDef.submenu && 
				this.state.focusType === FocusTypes.child &&
				this.state.focusAt === index
			)
			{
				submenus.push(
					<span key={index}>
						{<DropdownMenu
							id={{type:ChildTypes.submenu, index:index}}
							parent={this}
							subMenu={menuItemDef.submenu}
							offset={styles.submenu}
						/>}
					</span>
				);
			}

			if(!last)
				styles = this.incrementStyles(menuItemDef, $.extend(true, {}, styles));
		});

		return <span>
			{menuItems}
			{submenus}
		</span>;
	}

	/*override*/ protected getStyles(): Styles
	{
		let widest = 0;

		this.props.subMenu.forEach((item)=>
		{
			const width = this.getWidth(item); 
			if(width > widest)
				widest = width;
		});

		return {
			  label: 
				{ left: this.props.offset.left
				, top: this.props.offset.top
				, width: widest
				}
			, submenu:
				{ left: this.props.offset.left + widest
				, top: this.props.offset.top 
				}
		};

	}

	/*override*/ protected incrementStyles(menuItemDef: MenuItemDefinition, newStyles: Styles): Styles
	{
		newStyles.label.top += labelHeight;
		newStyles.submenu.top += labelHeight;
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

	/*override*/ protected onMouseEnter(id: Id, event: DropdownMenuEvent): DropdownMenuEvent
	{
		if(event.phase !== EventPhases.ready)
			return event;

		this.setState(
			{ focusAt: id.index
			, focusType: FocusTypes.self
			}
		);
		event.phase = EventPhases.consumed;
		return event;
	}

	/*override*/ protected onMouseLeave(id: Id, event: DropdownMenuEvent): DropdownMenuEvent
	{
		if(event.phase !== EventPhases.ready)
			return event;

		if(id.type === ChildTypes.label && id.index === this.state.focusAt &&
			this.state.focusType === FocusTypes.self)
			this.setState({focusAt:-1});
		
		event.phase = EventPhases.consumed;
		return event;
	}

	/*override*/ protected onClick(id: Id, event: DropdownMenuEvent): DropdownMenuEvent
	{
		if(event.closeParents)
			this.setState(
				{ focusAt:-1
				, focusType: FocusTypes.none
				});

		if(event.phase !== EventPhases.ready)
			return event;

		const menuItem = this.props.subMenu[id.index];

		if(menuItem.action)
		{
			menuItem.action();
			event.phase = EventPhases.consumed;
			event.closeParents = true;
			return event;
		}

		if(!menuItem.submenu)
			return event;
		
		let focusType: FocusTypes;			

		switch(this.state.focusType)
		{
			case FocusTypes.none:
			case FocusTypes.self:
				focusType = FocusTypes.child;
			break;
			case FocusTypes.child:
				if(id.index === this.state.focusAt)
					focusType = FocusTypes.none;
				else
					focusType = FocusTypes.child;
			break;
		}

		this.setState(
			{ focusAt: id.index
			, focusType: focusType
			}
		);
		event.phase = EventPhases.consumed;
		return event;
	}
}