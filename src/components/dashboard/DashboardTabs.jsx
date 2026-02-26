import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Button from '@mui/material/Button';

// Import tab content components
import Detail from './tabs/Detail';
import ClinicalAppropriateness from './tabs/ClinicalAppropriateness';
import PayorRestrictions from './tabs/PayorRestrictions';
import GramCommitment from './tabs/GramCommitment';
import Margin from './tabs/Margin';

function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`dashboard-tabpanel-${index}`}
			aria-labelledby={`dashboard-tab-${index}`}
			{...other}
		>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `dashboard-tab-${index}`,
		'aria-controls': `dashboard-tabpanel-${index}`,
	};
}

const DashboardTabs = () => {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<Box sx={{ width: '100%', mt: 4 }}>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={value}
					onChange={handleChange}
					aria-label='dashboard tabs'
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.95rem',
							color: 'var(--color-text-muted)',
							'&.Mui-selected': {
								color: 'var(--color-primary)',
							},
						},
						'& .MuiTabs-indicator': {
							backgroundColor: 'var(--color-primary)',
							height: 3,
						},
					}}
				>
					<Tab
						label='Detail'
						{...a11yProps(0)}
					/>
					<Tab
						label='Clinical Appropriateness'
						{...a11yProps(1)}
					/>
					<Tab
						label='Payor Restrictions'
						{...a11yProps(2)}
					/>
					<Tab
						label='Gram Commitment'
						{...a11yProps(3)}
					/>
					<Tab
						label='Margin'
						{...a11yProps(4)}
					/>
				</Tabs>
			</Box>
			<CustomTabPanel
				value={value}
				index={0}
			>
				<Detail />
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={1}
			>
				<ClinicalAppropriateness />
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={2}
			>
				<PayorRestrictions />
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={3}
			>
				<GramCommitment />
			</CustomTabPanel>
			<CustomTabPanel
				value={value}
				index={4}
			>
				<Margin />
			</CustomTabPanel>

			{/* Footer Actions Section */}
			{/* <Box
				sx={{
					mt: 4,
					pt: 3,
					borderTop: '1px solid #e2e8f0',
					display: 'flex',
					justifyContent: 'flex-end',
					alignItems: 'center',
					gap: 3,
					pb: 4,
				}}
			>
				<Button
					variant='text'
					sx={{
						textTransform: 'none',
						color: '#64748b',
						fontWeight: 500,
						fontSize: '0.875rem',
						'&:hover': {
							backgroundColor: 'transparent',
							color: 'var(--color-primary)',
						},
					}}
				>
					Export Report (PDF)
				</Button>

				<Button
					variant='contained'
					sx={{
						backgroundColor: 'var(--color-primary)',
						color: '#fff',
						textTransform: 'none',
						fontWeight: 700,
						padding: '10px 24px',
						borderRadius: '8px',
						fontSize: '0.875rem',
						boxShadow: 'none',
						'&:hover': {
							backgroundColor: 'var(--color-primary-hover)',
							boxShadow: 'none',
						},
					}}
				>
					Run New Analysis
				</Button>
			</Box> */}
		</Box>
	);
};

export default DashboardTabs;
