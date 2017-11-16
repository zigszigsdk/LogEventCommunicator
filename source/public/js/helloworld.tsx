import * as React from 'react';
import * as ReactDOM from 'react-dom';

export class HelloWorld extends React.Component<any, any>
{
	public render()
	{
		return <div>Hello world from react!</div>;
	}
}

ReactDOM.render
(   <HelloWorld compiler='TypeScript' framework='React' />
,   document.getElementById('react-root'),
);
