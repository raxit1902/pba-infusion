import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import EmptyState from '../../common/EmptyState';
import { api } from '../../../services/api';
import usePatientStore from '../../../store/usePatientStore';

const InfoSection = ({ title, rows }) => (
	<Paper
		variant='outlined'
		sx={{
			height: '100%',
			borderRadius: 'var(--radius-md)',
			borderColor: '#bfdbfe',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		<Box
			sx={{
				padding: '16px 24px',
				borderBottom: '1px solid #bfdbfe',
			}}
		>
			<Typography
				variant='subtitle2'
				sx={{
					fontWeight: 700,
					color: 'var(--color-primary)',
					letterSpacing: '0.01em',
					fontSize: '0.8rem',
					display: 'inline-block',
					borderBottom: '2px solid var(--color-primary)',
					paddingBottom: '2px',
				}}
			>
				{title}
			</Typography>
		</Box>
		<Box sx={{ flexGrow: 1 }}>
			{rows.map((row, index) => (
				<Box
					key={index}
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '12px 16px',
						borderBottom:
							index === rows.length - 1 ? 'none' : '1px solid #f1f5f9',
						gap: 2,
					}}
				>
					<Typography
						variant='body2'
						sx={{
							color: 'var(--color-text-muted)',
							fontSize: '0.875rem',
							fontWeight: 500,
							whiteSpace: 'nowrap',
							flexShrink: 0,
						}}
					>
						{row.label}
					</Typography>
					<Typography
						variant='body2'
						sx={{
							color: '#94a3b8',
							fontSize: '0.875rem',
							textAlign: 'right',
							wordBreak: 'break-word',
						}}
					>
						{row.value}
					</Typography>
				</Box>
			))}
		</Box>
	</Paper>
);

const Detail = () => {
	const [patientDetails, setPatientDetails] = React.useState({});
	const [payorDetails, setPayorDetails] = React.useState({});
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	const selectedMrn = usePatientStore((state) => state.selectedMrn);

	const memberInfo = [
		{
			label: 'First Name',
			value: patientDetails?.memberInfo?.Patient_FIRST_NAME,
		},
		{
			label: 'Last Name',
			value: patientDetails?.memberInfo?.Patient_LAST_NAME,
		},
		{ label: 'DOB', value: patientDetails?.memberInfo?.Patient_DOB },
		{ label: 'Address', value: patientDetails?.memberInfo?.Patient_ADDRESS },
		{ label: 'Contact', value: patientDetails?.memberInfo?.Patient_PHONE },
		{
			label: 'Salesrep Name',
			value: patientDetails?.memberInfo?.Patient_SALESREP,
		},
		{
			label: 'IS ICD Code',
			value: patientDetails?.memberInfo?.IS_ICD_Code,
		},
	];

	const prescriberInfo = [
		{
			label: 'First Name',
			value: patientDetails?.memberInfo?.Doctor_FirstName,
		},
		{ label: 'Last Name', value: patientDetails?.memberInfo?.Doctor_lastName },
		{ label: 'Contact', value: patientDetails?.memberInfo?.Doctor_phone },
		{ label: 'NPI Number', value: patientDetails?.memberInfo?.Doctor_NPI },
	];

	const renderInsuranceInfo = (insurance) => [
		{ label: 'Payor Name', value: insurance?.Insurance_Company_Name },
		{ label: 'Payor ID', value: insurance?.Insurance_Company_ID },
		{ label: 'Policy Number', value: insurance?.Policy_Number },
		{ label: 'Payor Type', value: insurance?.Payor_Type },
		{
			label: 'Payor Notes',
			value: insurance?.inscomp_NOTES || '-',
		},
	];

	useEffect(() => {
		if (!selectedMrn) {
			setLoading(false);
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [patientData, payorData] = await Promise.all([
					api.patient.getPatientDetails(selectedMrn),
					api.patient.getPayorInfo(selectedMrn),
				]);
				setPatientDetails(patientData || {});
				setPayorDetails(payorData || {});
			} catch (err) {
				console.error('API Error:', err);
				setError(
					err.message ||
					'Failed to fetch patient details. Please try again later.',
				);
			} finally {
				setLoading(false);
			}
		};

		if (api.patient && api.patient.getPatientDetails && api.patient.getPayorInfo) {
			fetchData();
		} else {
			console.error('API methods are missing on api.patient');
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

	if (loading || Object.keys(patientDetails).length === 0) {
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
			{/* Row 1: Member Info + Prescriber Info */}
			<Grid
				container
				spacing={3}
				className='detail-cont'
				sx={{ mb: 3 }}
			>
				<Grid
					item
					xs={12}
					md={6}
					sx={{ width: '100%' }}
				>
					<InfoSection
						title='MEMBER INFO'
						rows={memberInfo}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					md={6}
					sx={{ width: '100%' }}
				>
					<InfoSection
						title='PRESCRIBER INFO'
						rows={prescriberInfo}
					/>
				</Grid>
			</Grid>

			{/* Row 2: Payor/Policy Info */}
			<Grid container spacing={3}>
				{payorDetails?.insurances?.length > 0 ? (
					payorDetails.insurances.map((insurance, index) => (
						<Grid
							key={index}
							item
							xs={12}
							md={6}
							sx={{ width: '100%' }}
						>
							<InfoSection
								title={
									payorDetails.insurances.length > 1
										? `PAYOR/POLICY INFO - ${index + 1}`
										: 'PAYOR/POLICY INFO'
								}
								rows={renderInsuranceInfo(insurance)}
							/>
						</Grid>
					))
				) : (
					<Grid item xs={12}>
						<InfoSection
							title='PAYOR/POLICY INFO'
							rows={[{ label: 'Status', value: 'No insurance info available' }]}
						/>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default Detail;