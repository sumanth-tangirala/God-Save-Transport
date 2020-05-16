import * as React from 'react';

class DisplayMapClass extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			map: null
		}
	}
	static defaultProps = {
		lat: 51.51,
		lng: -0.13,
		zoom: 14,
	}
	mapRef = React.createRef();

	componentDidMount() {
		const H = window.H;
		const platform = new H.service.Platform({
			apikey: "wb620JMpEXicArNCaVP9aNNFOejRxRpKl7STGIkeGmw"
		});

		const defaultLayers = platform.createDefaultLayers();


		const {lat, lng, zoom } = this.props;

		const map = new H.Map(
			this.mapRef.current,
			defaultLayers.vector.normal.map,
			{
				center: { lat: lat, lng: lng },
				zoom: zoom,
			}
		);

		// MapEvents enables the event system
		// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
		new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

		// Create the default UI components to allow the user to interact with them
		H.ui.UI.createDefault(map, defaultLayers);

		this.setState({ map });
	}

	componentWillUnmount() {
		this.state.map.dispose();
	}

	render() {
		return <div ref={this.mapRef} style={{ height: "100vh" }} />;
	}
}

export default DisplayMapClass;
