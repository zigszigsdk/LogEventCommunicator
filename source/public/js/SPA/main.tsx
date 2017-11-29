import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Menubar, MenubarProps} from './GUI/Menubar/Menubar';

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

class Main extends React.Component<null, null>
{
	public render(): JSX.Element
	{
		const menubarProps: MenubarProps =
		{	hotkey: "Tab"
		,	offset: [5, 5]
		,	menubarItems:
			[
				{	label: "_File"
				,	hotkey: "F"
				,	submenu:
					[
						{	label: "_Log out"
						,	hotkey: "L"
						,	clickAction: logout
						}
					]
				}
			,	{	label: "_TopMenu"
				,	hotkey: "t"
				,	submenu:
					[
						{	label: "_MiddleMenu"
						,	hotkey: "m"
						,	submenu:
							[
								{	label: "_subMenu"
								,	hotkey: "s"
								,	clickAction: t1
								}
							]
						}
					,	{	label: "_reallyLongLabelToMessThingsUp"
						,	hotkey: "r"
						,	clickAction: t3
						}
					]
				}
			,	{	label: "T_est"
				,	hotkey: "e"
				,	submenu:
					[
						{	label: "Test2"
						,	hotkey: "t"
						,	clickAction: t2
						}
					]
				}
			]
		};

		return <div>
			{Menubar.makeTag(menubarProps)}
		</div>;
	}
}

ReactDOM.render(<Main/>, document.getElementById('react-root'));
