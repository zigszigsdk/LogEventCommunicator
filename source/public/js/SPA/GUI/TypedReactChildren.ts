import * as React from 'react';
import * as $ from 'jquery';

export interface DynamicTypedProps
{
	dynamicTypeName?: string;
}

type ReactNode = React.ReactNode;
type ReactChild = React.ReactChild;
type ReactElement<P> = React.ReactElement<P>;

type UnknownChild = Readonly<React.ReactChild>
	& Readonly<{props?: {dynamicTypeName?: string}}>

type Component<P> = Readonly<{ children?: ReactNode }>
	& Readonly<React.ReactElement<P>>

export class TypedReactChildren
{
	public static map<P extends DynamicTypedProps>(
		children: ReactNode,
		dynamicTypeName: string,
		mapper: (child: ReactElement<P>, index: number) => P
	): ReactChild[]
	{
		return React.Children.map(children, (unknownChild: UnknownChild, index: number) =>
		{
			if(!TypedReactChildren.isDynamicType(unknownChild, dynamicTypeName))
				return unknownChild;

			let componentChild: Component<P> = 
				$.extend(true, {}, unknownChild as Component<P>);
	
			return React.createElement(
				componentChild.type,
				mapper(componentChild, index) as any,
				componentChild.children);
		});
	}

	public static forEach<P extends DynamicTypedProps>(
		children: ReactNode,
		dynamicTypeName: string,
		iterator: (child: ReactElement<P>, index: number) => void
	): void
	{
		React.Children.forEach(children, (unknownChild: UnknownChild, index: number) =>
		{
			if(!TypedReactChildren.isDynamicType(unknownChild, dynamicTypeName))
				return;

			let componentChild: Component<P> = 
				$.extend(true, {}, unknownChild as Component<P>);
	
			iterator(componentChild, index);
		});
	}

	public static isDynamicType(unknownChild: UnknownChild, dynamicTypeName: string): boolean
	{
		return unknownChild.props &&
			unknownChild.props.dynamicTypeName === dynamicTypeName
	}
}