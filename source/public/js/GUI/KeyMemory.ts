import * as React from 'react';

interface Hash<Value>
{
    [key: string]: Value;
}

type keyboardEvent = React.KeyboardEvent<HTMLAnchorElement>;
type keyboardEventCallback = (keyboardEvent)=>void;
type keyboardEventCallbackTable = Hash<Array<keyboardEventCallback>>;

interface Subscriptions
{
	keyDown: keyboardEventCallbackTable
	keyUp: keyboardEventCallbackTable
	keyDownAlone: keyboardEventCallbackTable
	keyUpClean: keyboardEventCallbackTable
}


export class KeyMemory
{
	public static getInstance(): KeyMemory
	{
		return this.instance || (this.instance = new this());
	}

	private static instance: KeyMemory;

	private constructor(){}

	private keysDown: Hash<boolean> = {};

	private subscriptions: Subscriptions =
	{	keyDown: {}
	,	keyUp: {}
	,	keyDownAlone: {}
	,	keyUpClean: {}
	};

	private lastCleanDown: string = "";

	public onKeyDown = (event: keyboardEvent) =>
	{
		const wasEmpty = Object.keys(this.keysDown).length === 0;
		this.keysDown[event.key] = true;
		this.lastCleanDown = null;		

		if(wasEmpty)
		{	
			this.lastCleanDown = event.key;

			if(this.attemptConsume(event, this.subscriptions.keyDownAlone))
				return;
		}

		this.attemptConsume(event, this.subscriptions.keyDown)
	}

	public onKeyUp = (event: keyboardEvent) =>
	{
		delete this.keysDown[event.key];

		if(event.key === this.lastCleanDown &&
			this.attemptConsume(event, this.subscriptions.keyUpClean))
		{
			return;
		}

		this.attemptConsume(event, this.subscriptions.keyUp);
	}

	private attemptConsume(event: keyboardEvent, table: keyboardEventCallbackTable)
	{
		if(!table[event.key])
			return false;

		this.notify(table[event.key], event);
		event.preventDefault();
		return true;
	}

	public subscribeOnUp(key: string, callback: keyboardEventCallback)
	{
		this.subscribe(key, callback, this.subscriptions.keyUp);
	}

	public unsubscribeOnUp(key: string, callback: keyboardEventCallback)
	{
		this.unsubscribe(key, callback, this.subscriptions.keyUp);
	}

	private subscribe(
		key: string
	,	callback: keyboardEventCallback
	,	table: keyboardEventCallbackTable)
	{
		if(!table[key])
			table[key] = new Array();

		table[key].push(callback);
	}

	private unsubscribe(
		key: string
	,	callback: keyboardEventCallback
	,	table: keyboardEventCallbackTable)
	{
		for(let callbackIndex = 0
		;	callbackIndex < table[key][callbackIndex].length
		;	callbackIndex++
		)
			if(table[key][callbackIndex] === callback)
			{
				if(table[key].length === 1)
					delete table[key]
				else
					table[key].splice(callbackIndex, 1);
				return;
			}
	}

	private notify(subscribers: Array<keyboardEventCallback>, event: keyboardEvent)
	{
		for(let index in subscribers)
			subscribers[index](event);
	}
}