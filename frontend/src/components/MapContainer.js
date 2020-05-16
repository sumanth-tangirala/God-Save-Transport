import React, {Component} from 'react';
import Map from './HereMap'
import styles from '../styles/MapContainer.module.css'

class MapContainer extends Component {
	render() {
		const londonCoords = {
			lat: 51.51,
			lng: -0.13
		}
		return (
			<div className={styles.MapContainer}>
				<Map
					lat={londonCoords.lat}
					lng={londonCoords.lng}
					zoom={14}
				/>
			</div>
		);
	}
}

export default MapContainer;
