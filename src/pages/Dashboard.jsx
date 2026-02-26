import React from 'react';
import SearchMRN from '../components/searchMRN/SearchMRN';
import DashboardTabs from '../components/dashboard/DashboardTabs';

const Dashboard = () => {
	return (
		<div className='layout-container'>
			<SearchMRN />
			<DashboardTabs />
		</div>
	);
};

export default Dashboard;
