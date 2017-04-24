'use strict'

class Controller extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
			{	myCarsModel: this.props.myCarsModel
			};
	}

	updateServer(newState)
	{
		$.ajax(
		{	url: "/mycars"
		,	type: "POST"
		,	data: {cars: JSON.stringify(newState.myCarsModel)}
		,	cache: false
		,	success:
				function(response) {
					if(response !== "OK")
						return alert("Your changes were not saved. Refresh the page and try again");
					this.setState(newState);
				}.bind(this)
		,	error:
				function(xhr, status, err) {
					alert("Update failed. Refresh the page or try again later");
					console.error(this.props.url, status, err.toString());
				}.bind(this)
		});
	}

	save(carUpdate)
	{
		let newState = JSON.parse(JSON.stringify(this.state));
		const index = newState.myCarsModel.cars.map(function(x) {return x.id; }).indexOf(carUpdate.id);

		newState.myCarsModel.cars[index] = carUpdate;

		this.updateServer(newState);
	}

	addCar()
	{
		let newState = JSON.parse(JSON.stringify(this.state));
		newState.myCarsModel.cars.push(
			{	id: newState.myCarsModel.idCounter++
			, 	owner: ""
			, 	model: ""
			, 	year: ""
			}
		);
		this.setState(newState);
	}

	deleteCar(id)
	{
		let newState = JSON.parse(JSON.stringify(this.state));
		const index = newState.myCarsModel.cars.map(function(x) {return x.id; }).indexOf(id);

		newState.myCarsModel.cars.splice(index, 1);

		this.updateServer(newState);
	}

	render()
	{
		const cars = this.state.myCarsModel.cars.map((car, index) =>
			<div key={car.id}>
				<CarEditor
					savedData={ car }
					save={ (carUpdate)=>this.save(carUpdate)}
					deleteCar={(id)=>this.deleteCar(id)}
				/>
			</div>
		);

		return (
			<div>
				{cars}
				<button onClick={ ()=>{this.addCar()} }>New car</button>
			</div>
		);
	}
}

class CarEditor extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state =
			{	editing: this.props.savedData.owner === ""
			,	unsavedData: JSON.parse(JSON.stringify(this.props.savedData))
			};

		this.handleChange = this.handleChange.bind(this)
	}

	editStart()
	{
		this.setState({editing: true});
	}

	editEnd()
	{
		if(this.state.unsavedData.owner === "" ||
			this.state.unsavedData.model === "" ||
			this.state.unsavedData.year === "")
			return;

		this.setState({editing: false});
		this.props.save(this.state.unsavedData);
	}

	handleChange(event) {
		let newData = JSON.parse(JSON.stringify(this.state.unsavedData));
		newData[event.target.id] = event.target.value;
    	this.setState({unsavedData: newData});
  	}

	render()
	{
		if(this.state.editing)
			return (
				<div>
					<ul>
						<li>
							owner:
							<input type="text" value={this.state.unsavedData.owner} id="owner" onChange={this.handleChange} />
						</li>
						<li>
							model:
							<input type="text" value={this.state.unsavedData.model} id="model" onChange={this.handleChange} />
						</li>
						<li>
							year:
							<input type="text" value={this.state.unsavedData.year} id="year" onChange={this.handleChange} />
						</li>
					</ul>
					<button onClick={ ()=>{this.editEnd()} }>Save</button>
				</div>
			);
		return (
			<div>
				<ul>
					<li> owner: {this.props.savedData.owner} </li>
					<li> model: {this.props.savedData.model} </li>
					<li> year: 	{this.props.savedData.year} </li>
				</ul>
				<button onClick={ ()=>{this.editStart()} }>Edit</button>
				<button onClick={ ()=>{this.props.deleteCar(this.props.savedData.id)} }>Delete</button>
			</div>
		);
	}
}
const fetchDataUrl = "/mycars/mycarmodel";
$.ajax(
	{	url: fetchDataUrl
	,	type: "GET"
	,	cache: false
	,	success:
			function(data)
			{
				ReactDOM.render(
					<Controller myCarsModel={JSON.parse(data)}/>,
					document.getElementById('react-root'));
			}.bind(this)
	,	error:
			function(xhr, status, err)
			{
				alert("Page loading failed. Refresh the page or try again later")
				console.error(fetchDataUrl, status, err.toString());
			}.bind(this)
	}
);

