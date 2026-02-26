import React from 'react';
import usePatientStore from '../../store/usePatientStore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';

const SearchMRN = () => {
	const [referral, setReferral] = React.useState('');
	const [mrn, setMRN] = React.useState('');

	const handleMRNChange = (mrn) => {
		setMRN(mrn);
	};

	const handleChange = (event) => {
		setReferral(event.target.value);
	};

	const setSelectedMrn = usePatientStore((state) => state.setSelectedMrn);
	const resetPatientStore = usePatientStore((state) => state.resetPatientStore);

	const handleRetrive = () => {
		if (!mrn) {
			resetPatientStore();
			return;
		}

		const allowedMrns = ['1057340', '1056974'];
		const trimmedMrn = mrn.trim();

		if (trimmedMrn) {
			if (allowedMrns.includes(trimmedMrn)) {
				setSelectedMrn(trimmedMrn);
				console.log('Global MRN Updated:', trimmedMrn);
			} else {
				alert('No corresponding mrn details found.');
			}
		}
	};

	return (
		<Box
			sx={{
				marginTop: '20px',
				marginBottom: '20px',
				padding: '24px',
				border: '1px solid #bfdbfe', // Light blue border
				borderRadius: 'var(--radius-md)',
				boxShadow:
					'0 4px 6px -1px rgba(11, 119, 197, 0.1), 0 2px 4px -1px rgba(11, 119, 197, 0.06)', // Blue-ish shadow
			}}
		>
			<Grid
				container
				spacing={3}
				alignItems='flex-end'
			>
				{/* MRN Field */}
				<Grid
					item
					xs={12}
					md={5}
				>
					<Typography
						variant='subtitle2'
						sx={{
							mb: 1,
							fontWeight: 600,
							color: 'var(--color-primary)', // Primary blue
						}}
					>
						MRN (Medical Record Number)
					</Typography>
					<TextField
						fullWidth
						placeholder='Enter MRN...'
						variant='outlined'
						size='small'
						onChange={(e) => handleMRNChange(e.target.value)}
						sx={{
							'& .MuiOutlinedInput-root': {
								backgroundColor: 'var(--color-white)',
								'& fieldset': {
									borderColor: '#bfdbfe', // Light blue border
								},
								'&:hover fieldset': {
									borderColor: 'var(--color-primary-hover)',
								},
								'&.Mui-focused fieldset': {
									borderColor: 'var(--color-primary)',
								},
							},
						}}
					/>
				</Grid>

				{/* Retrieve Data Button */}
				<Grid
					item
					xs={12}
					md={2}
				>
					<Button
						variant='contained'
						fullWidth
						disableElevation
						onClick={() => handleRetrive()}
						sx={{
							height: '40px',
							textTransform: 'none',
							fontWeight: 600,
							backgroundColor: 'var(--color-primary)',
							'&:hover': {
								backgroundColor: 'var(--color-primary-hover)',
								boxShadow: '0 4px 6px -1px rgba(11, 119, 197, 0.4)',
							},
						}}
					>
						Retrieve Data
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
};

export default SearchMRN;
