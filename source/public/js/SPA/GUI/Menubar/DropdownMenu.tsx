import * as React from 'react';	
import {KeyMemory} from '../KeyMemory';
import {GUIElement, GUIProps, GUIState, Offset, MouseEvent, Id, UpstreamEvent, EventPhases, DownstreamEvent} from '../GUIElement';
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
	startFocusSelf?: boolean
	toggleFocusKey?: string
}

export enum FocusTypes {none, self, childOpen, childFocus};
export enum ChildTypes {label, submenu};

export interface DropdownMenuState extends GUIState
{
	focusType: FocusTypes
	focusAt: number
}

export interface DropdownMenuUpstream extends UpstreamEvent
{
	closeDropdown: boolean
}

export interface DropdownMenuDownstream extends DownstreamEvent
{
	closeDropdown: boolean
}

export type Child = React.ReactElement<DropdownMenuProps>;

export interface ArrowKeys
{
	nextElement: string
	previousElement: string
	openMenu: string
	closeMenu: string
};

const labelHeight = 18;

export class 
	DropdownMenu<P extends DropdownMenuProps, S extends DropdownMenuState
		, U extends DropdownMenuUpstream, D extends DropdownMenuDownstream>
	extends GUIElement<DropdownMenuProps, DropdownMenuState, U, D>
{
	static defaultProps: DropdownMenuProps = 
		{ parent: null
		, offset: {left: 0, top: 0}
		, label: ""
		, hotkey: ""
		, startFocusSelf: false
		};

	protected cssName: string = "DropdownMenu";
	protected arrowKeys: ArrowKeys = 
		{ nextElement: "ArrowDown"
		, previousElement: "ArrowUp"
		, openMenu: "ArrowRight"
		, closeMenu: "ArrowLeft"
		};

	private subElements: Array<DropdownMenuProps> = []

	constructor(props: DropdownMenuProps)
	{
		super(props);
		if(props.startFocusSelf)
			this.state = 
				{ focusType: FocusTypes.self
				, focusAt: 0
				};
		else
			this.state = 
				{ focusType: FocusTypes.none
				, focusAt: -1 
				};
	}

	public render(): JSX.Element
	{
		this.cleanChildRefs();
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
			const ft = this.state.focusType;
			if(this.state.focusAt === index
				&& (ft === FocusTypes.childFocus || ft === FocusTypes.childOpen))
			{
				child.props.offset = styles.submenu;
				child.props.parent = this;

				submenus.push(
					<DropdownMenu
						{...child.props} 
						key={"submenu"+index}
						ref={(x:DropdownMenu<P,S,U,D>)=>
							this.childrenToRecieveDownstreamEvent = [x]}
						startFocusSelf={this.state.focusType === FocusTypes.childFocus}
					/>
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

	protected cleanChildRefs()
	{
		this.subElements = [];
		this.childrenToRecieveDownstreamEvent = [];	
	}

	/*override*/ protected onKeyDown(event: DropdownMenuDownstream): DropdownMenuDownstream
	{
		if(event.closeDropdown)
			this.setState({focusAt:-1, focusType: FocusTypes.none})

		if(event.phase === EventPhases.consumed)
			return event;

		if(this.state.focusType === FocusTypes.none)
		{
			if(event.key === this.props.toggleFocusKey)
			{
				event.phase = EventPhases.consumed;
				this.setState({focusAt: 0, focusType: FocusTypes.self})
			}
			return event;
		}

		switch(event.key)
		{
			case this.props.toggleFocusKey:
				this.setState({focusAt: -1, focusType: FocusTypes.none})
				event.phase = EventPhases.consumed;
				break;

			case this.arrowKeys.nextElement:
				if(this.state.focusAt === this.subElements.length-1 
					|| this.state.focusAt === -1
				)
					this.setState({focusAt: 0, focusType: FocusTypes.self})
				else
					this.setState({focusAt: this.state.focusAt+1, focusType: FocusTypes.self})
				event.phase = EventPhases.consumed;
				break;
				
			case this.arrowKeys.previousElement:
				if(this.state.focusAt <= 0)
					this.setState({focusAt: this.subElements.length-1, focusType: FocusTypes.self})
				else
					this.setState({focusAt: this.state.focusAt-1, focusType: FocusTypes.self})
				event.phase = EventPhases.consumed;
				break;

			case "Enter":
				if(this.subElements[this.state.focusAt].action)
				{
					this.subElements[this.state.focusAt].action();
					event.closeDropdown = true;
					event.phase = EventPhases.consumed;
					break;
				}
				//fallthrough

			case this.arrowKeys.openMenu:
				if(this.state.focusType === FocusTypes.childFocus 
					|| this.state.focusAt === -1
					|| this.subElements[this.state.focusAt].action
				)
					break;

				this.setState({focusType: FocusTypes.childFocus})
				event.phase = EventPhases.consumed;
				break;

			case this.arrowKeys.closeMenu:
			case "Escape":
				if(this.state.focusType !== FocusTypes.childFocus)
					break;

				this.setState({focusType: FocusTypes.self});
				event.phase = EventPhases.consumed;
				break;
		}
		return event;
	}

	/*override*/ protected onMouseEnter(id: Id, event: U): U
	{
		if(event.phase !== EventPhases.ready || id.type !== ChildTypes.label)
			return event;

		event.phase = EventPhases.consumed;
		
		if(this.state.focusAt === id.index)
			return event;
		
		this.setState(
			{ focusAt: id.index
			, focusType: FocusTypes.self
			}
		);
		return event;
	}

	/*override*/ protected onMouseLeave(id: Id, event: U): U
	{
		if(event.phase !== EventPhases.ready)
			return event;

		if(id.type === ChildTypes.label && id.index === this.state.focusAt &&
			this.state.focusType === FocusTypes.self)
			this.setState({focusAt:-1});
		
		event.phase = EventPhases.consumed;
		return event;
	}

	/*override*/ protected onClick(id: Id, event: U): U
	{
		if(event.closeDropdown)
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
			event.closeDropdown = true;
			return event;
		}
		
		let focusType: FocusTypes;

		switch(this.state.focusType)
		{
			case FocusTypes.none:
			case FocusTypes.self:
				focusType = FocusTypes.childOpen;
			break;
			case FocusTypes.childFocus:
			case FocusTypes.childOpen:
				if(id.index === this.state.focusAt)
				{
					focusType = FocusTypes.self;
					this.cleanChildRefs();
				}
				else
					focusType = FocusTypes.childOpen;
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