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
class Main extends React.Component<null, null>
{
	public render(): JSX.Element
	{
		const menubarProps: MenubarProps =
		{	hotkey: "Tab"
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
			,	{	label: "_Test"
				,	hotkey: "t"
				,	submenu:
					[
						{	label: "_TestTest"
						,	hotkey: "t"
						,	clickAction: t1
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
