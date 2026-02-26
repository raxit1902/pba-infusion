import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import EmptyState from '../../common/EmptyState';
import usePatientStore from '../../../store/usePatientStore';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { api } from '../../../services/api';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const SectionHeader = ({ title }) => (
	<Box sx={{ mb: 2 }}>
		<Typography
			variant='subtitle2'
			sx={{
				color: 'var(--color-primary)',
				fontWeight: 700,
				letterSpacing: '0.01em',
				fontSize: '0.8rem',
				display: 'inline-block',
				borderBottom: '2px solid var(--color-primary)',
				paddingBottom: '2px',
				textTransform: 'uppercase',
			}}
		>
			{title}
		</Typography>
	</Box>
);

const PayorRestrictions = () => {
	const [payorRestrictions, setPayorRestrictions] = React.useState([]);
	const [selectedPayerIndex, setSelectedPayerIndex] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(null);
	const selectedMrn = usePatientStore((state) => state.selectedMrn);

	const handlePayerChange = (event) => {
		setSelectedPayerIndex(event.target.value);
	};

	const currentPayer = payorRestrictions[selectedPayerIndex] || {};

	const payorGuideQuestions = [
		{ question: 'Is whitebagging allowed?', key: 'IsWhiteBaggAllow' },
		{ question: 'Is Optum owned AIS allowed?', key: 'IsAISAllow' },
		{ question: 'IS PBM?', key: 'IsPBM' },
		{ question: 'IS Mandate SP?', key: 'IsMandateSP' },
		{ question: 'IS Nursing Valid Billable?', key: 'IsNursingValidBillable' },
	];

	// Filter out null/undefined to check for actual content
	const ivigDrugs = (currentPayer.IVIG || []).filter((d) => d !== null);
	const scigDrugs = (currentPayer.SCIG || []).filter((d) => d !== null);

	const showIvig = ivigDrugs.length > 0;
	const showScig = scigDrugs.length > 0;
	const hasFormulary = showIvig || showScig;

	const maxRows = Math.max(ivigDrugs.length, scigDrugs.length);

	useEffect(() => {
		if (!selectedMrn) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		// 1. Call the API method
		if (api.patient && api.patient.getPayorRestrictions) {
			api.patient
				.getPayorRestrictions(selectedMrn)
				.then((data) => {
					console.log('Payor Restrictions Data:', data.Payor_Guide_Details);
					const details = data?.Payor_Guide_Details || [];
					setPayorRestrictions(details);
					if (details.length > 0) {
						setSelectedPayerIndex(0);
					}
				})
				.catch((error) => {
					console.error('API Error:', error);
					setError(
						error.message ||
							'Failed to fetch patient details. Please try again later.',
					);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			console.error('getPatientDetails is missing on api.patient');
			setError('API service is unavailable.');
			setLoading(false);
		}
	}, [selectedMrn]);

	if (!selectedMrn) {
		return <EmptyState />;
	}

	if (error) {
		return (
			<Box sx={{ padding: '24px 0' }}>
				<Alert
					severity='error'
					variant='outlined'
					sx={{ borderRadius: 'var(--radius-md)' }}
				>
					<AlertTitle>Error</AlertTitle>
					{error}
				</Alert>
			</Box>
		);
	}

	if (loading || Object.keys(payorRestrictions).length === 0) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '400px',
				}}
			>
				<CircularProgress color='primary' />
			</Box>
		);
	}

	return (
		<Box sx={{ padding: '24px 0' }}>
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
				}}
			>
				{/* Payer Selection Dropdown */}
				<Box sx={{ mb: 4, maxWidth: 300 }}>
					<FormControl
						fullWidth
						size='small'
					>
						<InputLabel id='payer-select-label'>Select Payer</InputLabel>
						<Select
							labelId='payer-select-label'
							id='payer-select'
							value={selectedPayerIndex}
							label='Select Payer'
							onChange={handlePayerChange}
							sx={{
								borderRadius: 'var(--radius-sm)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: '#bfdbfe',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'var(--color-primary)',
								},
							}}
						>
							{payorRestrictions.map((payer, index) => (
								<MenuItem
									key={index}
									value={index}
								>
									{payer.PayerName}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				{/* Additional BV Notes */}
				<Box sx={{ mb: 4 }}>
					<SectionHeader title='ADDITIONAL BV NOTES' />
					<Box
						sx={{
							padding: '16px',
							border: '1px solid #bfdbfe',
							borderRadius: 'var(--radius-sm)',
							backgroundColor: '#fff',
							minHeight: '100px',
						}}
					>
						<Typography
							variant='body2'
							sx={{
								color: '#64748b',
								lineHeight: 1.6,
								fontSize: '0.85rem',
								whiteSpace: 'pre-line',
							}}
						>
							{payorRestrictions[selectedPayerIndex]?.AdditionalBVNotes ||
								'No additional notes available for this payer.'}
						</Typography>
					</Box>
				</Box>

				<Grid
					container
					spacing={4}
				>
					<Grid
						item
						xs={12}
						md={6}
					>
						<SectionHeader title='DRUG FORMULARY' />
						{!hasFormulary ? (
							<Box
								sx={{
									padding: '20px',
									border: '1px solid #bfdbfe',
									borderRadius: 'var(--radius-sm)',
									backgroundColor: '#f8fafc',
									textAlign: 'center',
								}}
							>
								<Typography
									variant='body2'
									sx={{ color: '#64748b', fontStyle: 'italic' }}
								>
									No preferred drugs found for this payer.
								</Typography>
							</Box>
						) : (
							<TableContainer
								component={Paper}
								variant='outlined'
								sx={{
									borderColor: '#bfdbfe',
									borderRadius: 'var(--radius-sm)',
								}}
							>
								<Table size='small'>
									<TableHead>
										<TableRow sx={{ backgroundColor: '#85a5b8ff' }}>
											{showIvig && (
												<TableCell
													sx={{
														fontWeight: 700,
														color: 'var(--color-text-main)',
														borderRight: showScig
															? '1px solid #bfdbfe'
															: 'none',
														borderColor: '#bfdbfe',
													}}
												>
													IVIG
												</TableCell>
											)}
											{showScig && (
												<TableCell
													sx={{
														fontWeight: 700,
														color: 'var(--color-text-main)',
														borderColor: '#bfdbfe',
													}}
												>
													SCIG
												</TableCell>
											)}
										</TableRow>
									</TableHead>
									<TableBody>
										{Array.from({ length: maxRows }).map((_, index) => (
											<TableRow key={index}>
												{showIvig && (
													<TableCell
														sx={{
															color: '#64748b',
															borderRight: showScig
																? '1px solid #bfdbfe'
																: 'none',
															borderColor: '#bfdbfe',
														}}
													>
														{ivigDrugs[index] || ''}
													</TableCell>
												)}
												{showScig && (
													<TableCell
														sx={{
															color: '#64748b',
															borderColor: '#bfdbfe',
														}}
													>
														{scigDrugs[index] || ''}
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</Grid>

					{/* Payor Guide */}
					<Grid
						item
						xs={12}
						md={6}
					>
						<SectionHeader title='ADDITIONAL INFO' />
						<TableContainer
							component={Paper}
							variant='outlined'
							sx={{ borderColor: '#bfdbfe', borderRadius: 'var(--radius-sm)' }}
						>
							<Table size='small'>
								<TableBody>
									{payorGuideQuestions.map((row, index) => {
										const answer = currentPayer[row.key] || 'N/A';
										return (
											<TableRow key={index}>
												<TableCell
													sx={{
														color: '#64748b',
														borderColor: '#bfdbfe',
														width: '80%',
														fontWeight: 600,
													}}
												>
													{row.question}
												</TableCell>
												<TableCell
													align='right'
													sx={{
														color:
															answer === 'Yes'
																? 'var(--color-success)'
																: answer === 'No'
																	? 'var(--color-error)'
																	: '#64748b',
														fontWeight: 500,
														borderColor: '#bfdbfe',
													}}
												>
													{answer}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
				</Grid>
			</Paper>
		</Box>
	);
};

export default PayorRestrictions;
