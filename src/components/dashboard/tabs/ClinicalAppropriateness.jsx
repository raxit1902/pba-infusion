import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import EmptyState from '../../common/EmptyState';
import usePatientStore from '../../../store/usePatientStore';
import { clinical_appropriateness_conditions } from '../../../constants/clinical_appropriateness';
import { api } from '../../../services/api';

const ClinicalAppropriateness = () => {
	const [clinicalData, setClinicalData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const selectedMrn = usePatientStore((state) => state.selectedMrn);

	useEffect(() => {
		if (!selectedMrn) return;

		setLoading(true);
		setError(null);

		api.patient.getClinicalAppropriateness(selectedMrn)
			.then((data) => {
				setClinicalData(data);
			})
			.catch((err) => {
				console.error('Error fetching clinical appropriateness:', err);
				setError(err.message || 'Failed to fetch clinical data.');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [selectedMrn]);

	if (!selectedMrn) {
		return <EmptyState />;
	}

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
				<CircularProgress size={40} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity='error' variant='outlined'>
					<AlertTitle>Error</AlertTitle>
					{error}
				</Alert>
			</Box>
		);
	}

	const hasData = clinicalData && Object.keys(clinicalData).length > 0;

	return (
		<Box sx={{ padding: '24px 0' }}>
			{!hasData ? (
				<Paper
					variant='outlined'
					sx={{
						padding: '40px',
						textAlign: 'center',
						borderRadius: 'var(--radius-md)',
						borderColor: '#bfdbfe',
						backgroundColor: '#f8fafc',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2,
					}}
				>
					<InfoOutlinedIcon
						sx={{ fontSize: 48, color: 'var(--color-primary)' }}
					/>
					<Box>
						<Typography
							variant='h6'
							sx={{ fontWeight: 600, color: 'var(--color-text-main)', mb: 1 }}
						>
							No Conditions Applicable
						</Typography>
					</Box>
				</Paper>
			) : (
				<Paper
					variant='outlined'
					sx={{
						borderRadius: 'var(--radius-md)',
						borderColor: '#bfdbfe',
						overflow: 'hidden',
					}}
				>
					{/* Header Section */}
					<Box
						sx={{
							padding: '16px 24px',
							borderBottom: '1px solid #bfdbfe',
						}}
					>
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
							}}
						>
							CHECK ALL CONDITIONS THAT APPLY
						</Typography>
					</Box>

					{/* List Section */}
					<Box>
						{clinical_appropriateness_conditions.map((condition, index) => {
							// Map condition IDs to the keys in the user-provided sample data
							const entryMapping = {
								'ig_hypersensitivity': 'hypersensitivityToIg',
								'iga_deficiency': 'igaDeficiencyWithAntiIgaAntibodies',
								'corn_hypersensitivity': 'hypersensitivityToCorn',
								'fructose_intolerance': 'hereditaryIntoleranceToFructose',
								'hyaluronidase_hypersensitivity': 'hypersensitivityToHyaluronidase',
								'albumin_hypersensitivity': 'hypersensitivityToHumanAlbumin',
								'hyperprolinemia': 'hyperprolinemia',
								'neonate_3_months': 'neonateLt3Months',
								'age_65_plus': 'gt65YearsOfAge',
								'diabetes': 'diabetes',
								'renal_insufficiency': 'renalInsufficencyImpairment',
								'cardiac_insufficiency': 'cardiacInsufficency',
								'pulmonary_insufficiency': 'pulmonaryInsufficency'
							};

							const dataKey = entryMapping[condition.id] || condition.id;
							const isChecked = clinicalData[dataKey] === 'yes' || clinicalData[dataKey] === 'Yes' || clinicalData[dataKey] === true;

							return (
								<Stack
									key={condition.id}
									direction='row'
									justifyContent='space-between'
									alignItems='center'
									sx={{
										padding: '8px 24px',
										borderBottom:
											index === clinical_appropriateness_conditions.length - 1
												? 'none'
												: '1px solid #f1f5f9',
										cursor: 'default',
									}}
								>
									<Typography
										variant='body2'
										sx={{
											color: 'var(--color-text-muted)',
											fontSize: '0.875rem',
											fontWeight: 500,
										}}
									>
										{condition.label}
									</Typography>
									<Checkbox
										size='small'
										checked={isChecked}
										disabled={true}
										sx={{
											padding: 0,
											color: '#e2e8f0',
											'&.Mui-checked': {
												color: 'var(--color-primary)',
											},
										}}
									/>
								</Stack>
							);
						})}
					</Box>
				</Paper>
			)}
		</Box>
	);
};

export default ClinicalAppropriateness;
