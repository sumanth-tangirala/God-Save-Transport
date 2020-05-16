import React from 'react';
import 'antd/dist/antd.css';
import {Menu, Button} from 'antd';
import {
	AppstoreOutlined,
	MenuUnfoldOutlined,
	MenuFoldOutlined,
	PieChartOutlined,
	DesktopOutlined,
	ContainerOutlined,
	MailOutlined,
} from '@ant-design/icons';

import styles from '../styles/Controls.module.css'

const {SubMenu} = Menu;

class Controls extends React.Component {
	state = {
		collapsed: false,
	};

	toggleCollapsed = () => {
		this.setState({
			collapsed: !this.state.collapsed,
		});
	};

	render() {
		return (
				<Menu
					defaultSelectedKeys={['1']}
					defaultOpenKeys={['sub1']}
					theme="dark"
					inlineCollapsed={this.state.collapsed}
					className={styles.menuContainer}
				>
					<Button
						type="primary"
						onClick={this.toggleCollapsed}
						className={styles.menuButton}
					>
						{this.state.collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
					</Button>
					<Menu.Item key="1" icon={<PieChartOutlined/>}>
						Option 1
					</Menu.Item>
					<Menu.Item key="2" icon={<DesktopOutlined/>}>
						Option 2
					</Menu.Item>
					<Menu.Item key="3" icon={<ContainerOutlined/>}>
						Option 3
					</Menu.Item>
					<SubMenu key="sub1" icon={<MailOutlined/>} title="Navigation One">
						<Menu.Item key="5">Option 5</Menu.Item>
						<Menu.Item key="6">Option 6</Menu.Item>
						<Menu.Item key="7">Option 7</Menu.Item>
						<Menu.Item key="8">Option 8</Menu.Item>
					</SubMenu>
					<SubMenu key="sub2" icon={<AppstoreOutlined/>} title="Navigation Two">
						<Menu.Item key="9">Option 9</Menu.Item>
						<Menu.Item key="10">Option 10</Menu.Item>
						<SubMenu key="sub3" title="Submenu">
							<Menu.Item key="11">Option 11</Menu.Item>
							<Menu.Item key="12">Option 12</Menu.Item>
						</SubMenu>
					</SubMenu>
				</Menu>
		);
	}
}

export default Controls;
