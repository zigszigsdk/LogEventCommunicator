import * as React from 'react';

interface Hash<Value>
{
    [key: string]: Value;
}

type keyboardEvent = React.KeyboardEvent<HTMLAnchorElement>;
type keyboardEventCallback = (keyboardEvent)=>void;
type keyboardEventCallbackTable = Hash<Array<keyboardEventCallback>>;

export class KeyMemory
{
	public static getInstance(): KeyMemory
	{
		return this.instance || (this.instance = new this());
	}

	private static instance: KeyMemory;

	private constructor(){}

	private keysDown: Hash<boolean> = {};

	private keyUpSubscriptions: keyboardEventCallbackTable = {}; 
	private cleanKeyUpSubscriptions: keyboardEventCallbackTable = {};

	private latestKeyDown: string = "";

	public onKeyDown = (event: keyboardEvent) =>
	{
		this.keysDown[event.key] = true;
		this.latestKeyDown = event.key;
	}

	public onKeyUp = (event: keyboardEvent) =>
	{
		delete this.keysDown[event.key];
		if(event.key === this.latestKeyDown && this.cleanKeyUpSubscriptions[event.key])
		{
			this.notify(this.cleanKeyUpSubscriptions[event.key], event);
			return event.preventDefault();
		}

		if(this.keyUpSubscriptions[event.key])
		{
			this.notify(this.keyUpSubscriptions[event.key], event);
			return event.preventDefault();
		}
	}

	public subscribeOnUp(key: string, callback: keyboardEventCallback)
	{
		if(!this.keyUpSubscriptions[key])
			this.keyUpSubscriptions[key] = new Array();

		this.keyUpSubscriptions[key].push(callback);	
	}

	public unsubscribeOnUp(key: string, callback: ()=>void)
	{
		for(var index = 0; index < this.keyUpSubscriptions[key][index].length ; index++)
			if(this.keyUpSubscriptions[key][index] === callback)
			{
				this.keyUpSubscriptions[key].splice(index, 1);
				return;
			}
	}

	private notify(subscribers: Array<keyboardEventCallback>, event: keyboardEvent)
	{
		for(let index in subscribers)
			subscribers[index](event);
	}
}