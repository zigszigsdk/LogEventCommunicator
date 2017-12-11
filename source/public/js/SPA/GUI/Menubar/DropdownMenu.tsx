import * as React from 'react';	
import {KeyMemory} from '../KeyMemory';
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, UpstreamEvent, EventPhases} from '../GUIElement';
import {TypedReactChildren} from "../TypedReactChildren";

import * as $ from 'jquery';
import {MouseListener} from '../MouseListener';

export type Style = React.CSSProperties;

export interface Styles 
{
	label: Style
	submenu: Offset
}

export interface DropdownMenuProps extends GUIProps
{
	label?: string
	hotkey?: string
	action?: ()=>void
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

export type Child = React.ReactElement<DropdownMenuProps>;

const labelHeight = 18;

export class DropdownMenu<P extends DropdownMenuProps, S extends DropdownMenuState, E extends DropdownMenuEvent>
	extends GUIElement<DropdownMenuProps, DropdownMenuState, DropdownMenuEvent>
{
	static defaultProps: DropdownMenuProps = 
		{ parent: null
		, offset: {left: 0, top: 0}
		, label: ""
		, hotkey: ""
		};

	protected cssName: string = "DropdownMenu";
	protected subElements: Array<DropdownMenuProps> = []

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
		let prevChild: Child = undefined;
		
		const iterator = (child: Child, index: number) =>
		{
			styles = this.incrementStyles(child, prevChild, $.extend(true, {}, styles));
			prevChild = child;

			const className: string = this.cssName + 
							(this.state.focusAt === index ? "--highlight" : "");

			menuItems.push(
				<MouseListener 
					parent={this}
					key={"label"+index}
					id={{index: index, type:ChildTypes.label}}
					offset={this.props.offset}
				>
					<span
						className={className}
						style={styles.label}
					>
						{child.props.label}
					</span>
				</MouseListener>
			);
			
			if(this.state.focusType === FocusTypes.child &&
				this.state.focusAt === index
			)
			{
				child.props.offset = styles.submenu;
				child.props.parent = this;
				submenus.push(
					<span key={"submenu"+index}>
						{child}
					</span>
				);
			}

			this.subElements.push(child.props);
		};
		
		TypedReactChildren.forEachOfType<Child>(
			this.props.children, DropdownMenu, iterator, true);

		return <span>
			{menuItems}
			{submenus}
		</span>;
	}

	/*override*/ protected getStyles(): Styles
	{
		let widest = 0;

		TypedReactChildren.forEachOfType<Child>(this.props.children, DropdownMenu,
			(child: Child, index: number) =>
			{
				const width = this.getWidth(child); 
				if(width > widest)
					widest = width;
			}
		);

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

	/*override*/ protected incrementStyles(child: Child, prevChild: Child, newStyles: Styles): Styles
	{
		if(prevChild === undefined)
			return newStyles;

		newStyles.label.top += labelHeight;
		newStyles.submenu.top += labelHeight;
		return newStyles;
	}

	protected getWidth(child: Child): number
	{
		const renderObject = 
			$('<span>' + child.props.label + '</span>')
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

	/*override*/ protected onClick(id: Id, event: E): E
	{
		if(event.closeParents)
		{
			this.setState(
				{ focusAt:-1
				, focusType: FocusTypes.none
				});
			return event;
		}
		if(event.phase !== EventPhases.ready || id.type !== ChildTypes.label)
			return event;

		const child: DropdownMenuProps = this.subElements[id.index];

		if(child.action)
		{
			child.action();
			event.phase = EventPhases.consumed;
			event.closeParents = true;
			return event;
		}
		
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