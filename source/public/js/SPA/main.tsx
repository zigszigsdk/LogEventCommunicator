import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DropdownMenu} from "./GUI/Menubar/DropdownMenu";
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
		return <div>
			<Menubar parent={this} offset={{left:10, top:10}}>
				test1
				<div>test2</div>
				<DropdownMenu label="File" hotkey="f">
					<DropdownMenu label="Logout" hotkey="l" action={logout}/>
				</DropdownMenu>
				<DropdownMenu label="top menu" hotkey="t">
					<DropdownMenu label="test1" hotkey="t" action={t1}/>
					<DropdownMenu label="second menu" hotkey="s">
						<DropdownMenu label="third menu" hotkey="t">
							<DropdownMenu label="fourth menu" hotkey="f">
								<DropdownMenu label="last menu" hotkey="l">
									<DropdownMenu label="last label" hotkey="l" action={t2}/>
								</DropdownMenu>
							</DropdownMenu>
						</DropdownMenu>
						<DropdownMenu label="really long label to change menusize" hotkey="r" action={t2}/>
					</DropdownMenu>
				</DropdownMenu>
				<DropdownMenu label="bare topmenu item" hotkey="l" action={t3}/>
			</Menubar>
		</div>;
	}

	public recieveUpstreamEvent(childId: Id, event: UpstreamEvent): UpstreamEvent
	{
		return event;
	}
}


ReactDOM.render(<Main/>, document.getElementById('react-root'));
