import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const EmptyState = ({
	title = 'No MRN Selected',
	message = 'Please enter a valid patient MRN to view details.',
	severity = 'info',
}) => {
	return (
		<Box sx={{ padding: '24px 0' }}>
			<Alert
				severity={severity}
				variant='outlined'
				sx={{ borderRadius: 'var(--radius-md)' }}
			>
				<AlertTitle>{title}</AlertTitle>
				{message}
			</Alert>
		</Box>
	);
};

export default EmptyState;
