import * as React from 'react';
import * as $ from 'jquery';

type ReactNode = React.ReactNode;
type ReactChild = React.ReactChild;
type ReactElement<P> = React.ReactElement<P>;

type componentConstructor<P> = (props: P & { children?: ReactNode }, context?: any) => 
	ReactElement<any> | React.Component<P, React.ComponentState> | null

type UnknownChild = Readonly<React.ReactChild> 
	& Readonly<{type?: componentConstructor<any>, props?: {dynamicTypeName?: string}}>;

type TagChild = UnknownChild;

type ComponentPropsFinish = 
	Readonly<{props: {dynamicTypeName: string, children?: React.ReactNode}}>;

type Component<P> = Readonly<React.ReactElement<P>> & ComponentPropsFinish;

type Handler<C, R> = (child: C, index: number) => R

interface HandlingOptions<C, R>
{
	handler: Handler<C, R>
	copy?: boolean
}
type PropMapper = Handler<Component<any>, {}>;
type ComponentMapper = Handler<Component<any>, Component<any>>;
type textMapper = Handler<string, string>;

type Iterator = Handler<Component<any>, void>;

interface Handlers<RESULT_ELEMENT, RESULT_PROPS>
{
	components?:
	{
		[stringifiedConstructor: string]: HandlingOptions<Component<any>, RESULT_PROPS>
		default?: HandlingOptions<Component<any>, RESULT_PROPS>
	}
	tags?:
	{
		[tagName: string]: HandlingOptions<TagChild, RESULT_ELEMENT>
		default?: HandlingOptions<TagChild, RESULT_ELEMENT>
	}
	text?: HandlingOptions<string, RESULT_ELEMENT>
}

type Iterators = Handlers<void, void>;
type Mappers = Handlers<Component<any>, {}>;

type MapperReturnTypes = Component<any> | string | undefined;

export class TypedReactChildren
{
	public static mapOfType<T>(
		  children: ReactNode
		, dynamicType: Function | string | undefined
		, mapper: Handler<T|string, MapperReturnTypes>
		, copy: boolean = false
		): void
	{
		React.Children.forEach(children, (child: UnknownChild, index: number) =>
		{
			if(''+child.type !== ''+dynamicType)
				return;

			let mapResult;

			switch(typeof child.type)
			{
				case undefined: //text
					mapResult = mapper(child as string, index);
					return;
				case 'string': //tag
				case 'function': //react component
					const options: HandlingOptions<T, void> 
						= {handler: mapper, copy: copy}
					mapResult = TypedReactChildren.applyHandler<void>(options, index, child);
					return;
			}

			switch(typeof mapResult.type)
			{
				case undefined: //text
				case 'string': //tag
				case 'function': //component
					return mapResult;
				case 'object': //props
					return TypedReactChildren.propsToElement(
						child as Component<any>, mapResult);
			}
			
		});
	}

	public static map(children: ReactNode, mappers: Mappers): ReactChild[]
	{
		return React.Children.map(children, 
			(unknownChild: UnknownChild, index: number) =>
		{		
			return TypedReactChildren.applyHandlers(mappers, TypedReactChildren.propsToElement, unknownChild, index);
		});
	}

	public static forEachOfType<T>(
		  children: ReactNode
		, dynamicType: Function | string | undefined
		, iterator: Handler<T|string, void>
		, copy: boolean = false
		): void
	{
		React.Children.forEach(children, (child: UnknownChild, index: number) =>
		{
			if(''+child.type !== ''+dynamicType)
				return;

			switch(typeof child.type)
			{
				case undefined: //string
					iterator(child as string, index);
					return;
				case 'string': //tag
				case 'function': //react component
					const options: HandlingOptions<T, void> 
						= {handler: iterator, copy: copy}
					TypedReactChildren.applyHandler<void>(options, index, child);
					return;
			}
			
		});
	}

	public static forEach(children: ReactNode, iterators: Iterators): void
	{
		React.Children.forEach(children, 
			(unknownChild: UnknownChild, index: number) =>
		{		
			return TypedReactChildren.applyHandlers(iterators, ()=>undefined, unknownChild, index);
		});
	}

	private static applyHandlers<RESULT_ELEMENT, RESULT_PROPS>
		( handlers: Handlers<RESULT_ELEMENT, RESULT_PROPS>
		, resultPropsToElement: 
			(child: UnknownChild, props: RESULT_PROPS) => RESULT_ELEMENT
		, unknownChild: UnknownChild
		, index: number
		): RESULT_ELEMENT
	{
		switch(typeof unknownChild.type)
		{
		case undefined: //plain html text
			return TypedReactChildren.applyFirstHandler<RESULT_ELEMENT>(
				[handlers.text], index, unknownChild)
		case 'string': //html <tag> - .type string says which tag it is
			if(!handlers.tags)
				return undefined;
			const tagHandlers = [ handlers.tags[unknownChild.type as string]
								, handlers.tags.default
							 	];
			return TypedReactChildren.applyFirstHandler<RESULT_ELEMENT>(
				tagHandlers, index, unknownChild)
		case 'function': //react component constructor
			if(!handlers.components)
				return undefined;
			const compHandlers = [ handlers.components[unknownChild.type as string]
							 	 , handlers.components.default
							 	 ];

			return resultPropsToElement(
				unknownChild,
				TypedReactChildren.applyFirstHandler<RESULT_PROPS>(
					compHandlers, index, unknownChild));
		}
	}

	private static applyFirstHandler<RESULT_TYPE>(potentialHandlers: Array<HandlingOptions<any, RESULT_TYPE>>
		, index: number, child: UnknownChild): RESULT_TYPE
	{
		for(let handlersIndex: number = 0; handlersIndex < potentialHandlers.length-1; handlersIndex++)
		{
			if(potentialHandlers[handlersIndex])
				return TypedReactChildren.applyHandler<RESULT_TYPE>(
					potentialHandlers[handlersIndex], index, child);
		}
	}

	private static applyHandler<RESULT_TYPE>(handlingOptions: HandlingOptions<any, RESULT_TYPE>
		, index: number, child: Component<any> | UnknownChild | string): RESULT_TYPE
	{
		return handlingOptions.handler
			(	handlingOptions.copy ? $.extend(true, {}, child) : child
			,	index
			);
	}

	private static propsToElement(
		child: Component<any>, props: any): React.ReactElement<any>
	{
		return React.createElement(child.type, props, child.props.children);
	}
}