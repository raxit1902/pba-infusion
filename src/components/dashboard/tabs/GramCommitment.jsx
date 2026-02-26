import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import EmptyState from '../../common/EmptyState';
import usePatientStore from '../../../store/usePatientStore';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { api } from '../../../services/api';

const GramCommitment = () => {
	const [drugData, setDrugData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const selectedMrn = usePatientStore((state) => state.selectedMrn);

	useEffect(() => {
		if (!selectedMrn) return;

		setLoading(true);
		setError(null);

		api.patient
			.getGramCommitment(selectedMrn)
			.then((data) => {
				setDrugData(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				console.error('Error fetching gram commitment:', err);
				setError(err.message || 'Failed to fetch gram commitment data.');
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

	const totalData = drugData.reduce(
		(acc, item) => ({
			UnitConsumedtillDate: acc.UnitConsumedtillDate + (item.UnitConsumedtillDate || 0),
			Committed2026: acc.Committed2026 + (item.Committed2026 || 0),
		}),
		{ UnitConsumedtillDate: 0, Committed2026: 0 },
	);

	const formatNumber = (num) => {
		if (num === null || num === undefined) return '';
		return num.toLocaleString();
	};

	const getRowBackground = (item) => {
		if (item.value1 === null || item.value2 === null) return '#fff';
		if (item.value1 < item.value2) return '#fef2f2'; // Light green
		if (item.value1 > item.value2) return '#f0fdf4'; // Light red
		return '#fff';
	};

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
				{/* Header Section */}
				<Box sx={{ mb: 3 }}>
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
						GRAM COMMITMENT
					</Typography>
				</Box>

				{/* Table Section */}
				<TableContainer
					component={Paper}
					variant='outlined'
					sx={{ borderColor: '#bfdbfe', borderRadius: 'var(--radius-sm)' }}
				>
					<Table size='small'>
						<TableHead>
							<TableRow sx={{ backgroundColor: '#fff' }}>
								<TableCell
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Drug Name
								</TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Unit Consumed till Date
								</TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Committed 2026
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{drugData.map((row, index) => (
								<TableRow
									key={index}
									sx={{
										backgroundColor: getRowBackground(row),
										'&:hover': {
											filter: 'brightness(0.98)',
										},
									}}
								>
									<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
										{row.DrugName}
									</TableCell>
									<TableCell
										align='right'
										sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
									>
										{formatNumber(row.UnitConsumedtillDate)}
									</TableCell>
									<TableCell
										align='right'
										sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
									>
										{formatNumber(row.Committed2026)}
									</TableCell>
								</TableRow>
							))}
							{/* Total Row */}
							<TableRow sx={{ backgroundColor: '#f8fafc' }}>
								<TableCell
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
									}}
								>
									Total
								</TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
									}}
								>
									{formatNumber(totalData.UnitConsumedtillDate)}
								</TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
									}}
								>
									{formatNumber(totalData.Committed2026)}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	);
};

export default GramCommitment;
