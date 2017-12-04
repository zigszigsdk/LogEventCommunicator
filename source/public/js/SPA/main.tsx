import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {MenuItemDefinition} from "./GUI/Menubar/DropdownMenu";
import {Menubar} from './GUI/Menubar/Menubar';
import {GUIElement, GUIProps, GUIState, MouseEvent, Id, GUIElementUpstream, UpstreamEvent, EventPhases} from "./GUI/GUIElement";

function logout()
{
	console.log("Logging out!");
}
function t1()
{
	console.log("t1!");
}
function t2()
{
	console.log("t2!");
}
function t3()
{
	console.log("t3!");
}

class Main extends React.Component<any, any> implements GUIElementUpstream
{
	public render(): JSX.Element
	{
		const menuRoot: Array<MenuItemDefinition> =
			[
				{	label: "File"
				,	hotkey: "F"
				,	submenu:
					[
						{	label: "Log out"
						,	hotkey: "L"
						,	action: logout
						}
					]
				}
			,	{	label: "TopMenu"
				,	hotkey: "t"
				,	submenu:
					[
						{	label: "MiddleMenu"
						,	hotkey: "m"
						,	submenu:
							[
								{	label: "SubLabel"
								,	hotkey: "l"
								,	action: t1
								}
							,	{	label: "SubMenu"
								,	hotkey: "m"
								,	submenu:
									[	{ label: "SubSubLabel"
										, hotkey: "l"
										, action: t1
										}
									,	{ label: "SubSubMenu"
										, hotkey: "m"
										, submenu:
											[	{ label: "finalLabel"
												, hotkey: "f"
												, action: t1
												}
											]
										}
									]
								}
							]
						}
					,	{	label: "Centerlabel"
						,	hotkey: "c"
						,	action: t3
						}
					,	{	label: "ReallyLongLabelToMessThingsUp"
						,	hotkey: "r"
						,	action: t3
						}
					]
				}
			,	{	label: "Test"
				,	hotkey: "e"
				,	submenu:
					[
						{	label: "Test2"
						,	hotkey: "t"
						,	action: t2
						}
					]
				}
			];

		return <div>
			<Menubar
				parent={this}
				offset={{left:10, top:10}}
				subMenu={menuRoot}
			/>
		</div>;
	}

	public recieveUpstreamEvent(childId: Id, event: UpstreamEvent): UpstreamEvent
	{
		return event;
	}
}

ReactDOM.render(<Main/>, document.getElementById('react-root'));
