import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import EmptyState from '../../common/EmptyState';
import usePatientStore from '../../../store/usePatientStore';
import { api } from '../../../services/api';

const HOURLY_RATES = {
	IL: 41.36,
	CA: 76.4,
	KS: 48.73,
	default: 50.0,
};

const Margin = () => {
	const [marginData, setMarginData] = useState(null);
	const [payorCostData, setPayorCostData] = useState(null);
	const [finalNursingItems, setFinalNursingItems] = useState([]);
	const [nursingQuantities, setNursingQuantities] = useState({});
	const [nursingCostInputs, setNursingCostInputs] = useState({});
	const [perDiemItems, setPerDiemItems] = useState([]);
	const [perDiemQuantities, setPerDiemQuantities] = useState({});
	const [perDiemCostInputs, setPerDiemCostInputs] = useState({});
	const [drugPricingItems, setDrugPricingItems] = useState([]);
	const [selectedDrugs, setSelectedDrugs] = useState([]);
	const [drugQuantities, setDrugQuantities] = useState({});
	const [nursingCostData, setNursingCostData] = useState([]);
	const [financialAssistanceData, setFinancialAssistanceData] = useState(null);
	const [selectedPayor, setSelectedPayor] = useState('');
	const [selectedNurseState, setSelectedNurseState] = useState('');
	const [visitDuration, setVisitDuration] = useState('');
	const [travelTime, setTravelTime] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [providerProfitabilityData, setProviderProfitabilityData] = useState(
		[],
	);
	const [npiSearch, setNpiSearch] = useState('');
	const [matchedProvider, setMatchedProvider] = useState(null);
	const [dxCode, setDxCode] = useState('');
	const [selectedPrefDrugs, setSelectedPrefDrugs] = useState([]);
	const [selectedContraindications, setSelectedContraindications] = useState(
		[],
	);

	const selectedMrn = usePatientStore((state) => state.selectedMrn);

	// Helper to separate payor cost items into three categories
	const separatePayorItems = (items) => {
		const nursingHcpcs = ['99601', '99602'];
		setFinalNursingItems(
			items.filter((item) => nursingHcpcs.includes(item.hcpc)),
		);
		setPerDiemItems(
			items.filter((item) =>
				item.cleanDrug?.toLowerCase().startsWith('per diem'),
			),
		);
		const allDrugs = items.filter(
			(item) =>
				!nursingHcpcs.includes(item.hcpc) &&
				!item.cleanDrug?.toLowerCase().startsWith('per diem'),
		);
		// Deduplicate: keep only the entry with the lowest expectedGram per drug name
		const drugMap = new Map();
		allDrugs.forEach((item) => {
			const existing = drugMap.get(item.cleanDrug);
			if (
				!existing ||
				(item.expectedGram || 0) < (existing.expectedGram || 0)
			) {
				drugMap.set(item.cleanDrug, item);
			}
		});
		setDrugPricingItems(Array.from(drugMap.values()));
	};

	useEffect(() => {
		if (!selectedMrn) return;

		setLoading(true);
		setError(null);

		Promise.all([
			api.patient.getMarginData(selectedMrn),
			api.patient.getPayorCostData(selectedMrn),
			api.patient.getNursingCostData(selectedMrn),
			api.patient.getProviderProfitability(selectedMrn),
			api.patient.getFinancialAssistanceData(selectedMrn),
		])
			.then(([data, payorData, nursingData, providerData, faData]) => {
				setMarginData(data);
				setPayorCostData(payorData);
				setNursingCostData(nursingData || []);
				setProviderProfitabilityData(providerData || []);
				setFinancialAssistanceData(faData);

				if (
					payorData &&
					payorData.uniquePayors &&
					payorData.uniquePayors.length > 0
				) {
					const firstPayor = payorData.uniquePayors[0];
					setSelectedPayor(firstPayor);
					const items =
						payorData.payors?.find((p) => p.name === firstPayor)?.items || [];
					separatePayorItems(items);
				}

				if (nursingData && nursingData.length > 0) {
					setSelectedNurseState(nursingData[0].nurse_home_state);
					setVisitDuration(nursingData[0].visit_duration || 2);
					setTravelTime(nursingData[0].travel_time ?? 1.0);
				}
			})
			.catch((err) => {
				console.error('Error fetching margin/payor/nursing data:', err);
				setError(err.message || 'Failed to fetch tab data.');
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
			<Box sx={{ p: 3 }}>
				<Alert
					severity='error'
					variant='outlined'
				>
					<AlertTitle>Error</AlertTitle>
					{error}
				</Alert>
			</Box>
		);
	}

	if (!marginData) return null;

	const formatValue = (val) => {
		if (val === null || val === undefined || val === '') return 'Autofilled';
		if (typeof val === 'number') {
			return val.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		}
		return val.toLocaleString();
	};

	const currentPayorItems =
		payorCostData?.payors?.find((p) => p.name === selectedPayor)?.items || [];

	const currentNursingDetails =
		nursingCostData.find((n) => n.nurse_home_state === selectedNurseState) ||
		nursingCostData[0];

	const calculateEstimatedCost = () => {
		if (!selectedNurseState) return 0;
		const rate = HOURLY_RATES[selectedNurseState] || HOURLY_RATES.default;
		const travelTimeVal = parseFloat(travelTime) || 0;
		const duration = parseFloat(visitDuration) || 0;
		return (duration + travelTimeVal) * rate;
	};

	const estimatedCost = calculateEstimatedCost();

	return (
		<Box sx={{ padding: '24px 0' }}>
			{/* Preferred Drug Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Preferred Drug Table
				</Typography>

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
										width: '40%',
									}}
								>
									IGDT Category
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Category Preferred Drug
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(marginData.preferredDrugTable || []).map((row, index) => (
								<TableRow key={index}>
									<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
										{row.category}
									</TableCell>
									<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
										{row.drug}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Financial Assistance Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Financial Assistance Table
				</Typography>

				<Grid
					container
					spacing={2}
					sx={{ mb: 3 }}
				>
					<Grid
						item
						xs={12}
						sm={4}
					>
						<FormControl
							fullWidth
							size='small'
						>
							<Typography
								variant='caption'
								sx={{ mb: 0.5, fontWeight: 600, color: '#64748b' }}
							>
								Dx Code
							</Typography>
							<TextField
								fullWidth
								size='small'
								variant='outlined'
								value={dxCode}
								onChange={(e) => setDxCode(e.target.value)}
								placeholder='Enter Dx Code'
								sx={{
									'& .MuiOutlinedInput-root': { fontSize: '0.8rem' },
								}}
							/>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}
					>
						<FormControl
							fullWidth
							size='small'
						>
							<Typography
								variant='caption'
								sx={{ mb: 0.5, fontWeight: 600, color: '#64748b' }}
							>
								Category Preferred Drug
							</Typography>
							<Select
								multiple
								value={selectedPrefDrugs}
								onChange={(e) => setSelectedPrefDrugs(e.target.value)}
								input={<OutlinedInput size='small' />}
								renderValue={(selected) =>
									selected.length === 0
										? 'All Drugs'
										: `${selected.length} selected`
								}
								displayEmpty
								sx={{ fontSize: '0.8rem' }}
							>
								{Array.from(
									new Set(
										(financialAssistanceData?.drug_list || []).map(
											(d) => d.CategoryPreferredDrug,
										),
									),
								)
									.sort()
									.map((name) => (
										<MenuItem
											key={name}
											value={name}
											sx={{ fontSize: '0.8rem' }}
										>
											<Checkbox
												checked={selectedPrefDrugs.indexOf(name) > -1}
												size='small'
											/>
											<ListItemText
												primary={name}
												primaryTypographyProps={{ fontSize: '0.8rem' }}
											/>
										</MenuItem>
									))}
							</Select>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={12}
						sm={4}
					>
						<FormControl
							fullWidth
							size='small'
						>
							<Typography
								variant='caption'
								sx={{ mb: 0.5, fontWeight: 600, color: '#64748b' }}
							>
								Clinical Contraindication
							</Typography>
							<Select
								multiple
								value={selectedContraindications}
								onChange={(e) => setSelectedContraindications(e.target.value)}
								input={<OutlinedInput size='small' />}
								renderValue={(selected) =>
									selected.length === 0
										? 'All Contraindications'
										: `${selected.length} selected`
								}
								displayEmpty
								sx={{ fontSize: '0.8rem' }}
							>
								{Array.from(
									new Set(
										(financialAssistanceData?.drug_list || []).map(
											(d) => d.ClincalContraindication,
										),
									),
								)
									.sort()
									.map((name) => (
										<MenuItem
											key={name}
											value={name}
											sx={{ fontSize: '0.8rem' }}
										>
											<Checkbox
												checked={selectedContraindications.indexOf(name) > -1}
												size='small'
											/>
											<ListItemText
												primary={name}
												primaryTypographyProps={{ fontSize: '0.8rem' }}
											/>
										</MenuItem>
									))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>

				<TableContainer
					component={Paper}
					variant='outlined'
					sx={{
						borderColor: '#bfdbfe',
						borderRadius: 'var(--radius-sm)',
						maxWidth: '600px',
					}}
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
									Category Preferred Drug
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
									Max Assistance
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{!dxCode ? (
								<TableRow>
									<TableCell
										colSpan={2}
										sx={{
											color: '#94a3b8',
											borderColor: '#bfdbfe',
											py: 4,
											textAlign: 'center',
											fontStyle: 'italic',
										}}
									>
										Please enter a DX code to see financial assistance programs
									</TableCell>
								</TableRow>
							) : (
								(() => {
									const filtered = (
										financialAssistanceData?.drug_list || []
									).filter((item) => {
										const matchDx = item.DXCode === dxCode;
										const matchDrug =
											selectedPrefDrugs.length === 0 ||
											selectedPrefDrugs.includes(item.CategoryPreferredDrug);
										const matchContra =
											selectedContraindications.length === 0 ||
											selectedContraindications.includes(
												item.ClincalContraindication,
											);
										return matchDx && matchDrug && matchContra;
									});
									if (filtered.length === 0) {
										const activeFilters = [];
										if (selectedPrefDrugs.length > 0)
											activeFilters.push('Drugs');
										if (selectedContraindications.length > 0)
											activeFilters.push('Contraindications');

										return (
											<TableRow>
												<TableCell
													colSpan={2}
													sx={{
														color: '#ef4444',
														borderColor: '#bfdbfe',
														py: 4,
														textAlign: 'center',
													}}
												>
													No matching data found for DX code:{' '}
													<strong>{dxCode}</strong>
													{activeFilters.length > 0 &&
														` and selected ${activeFilters.join(' & ')}`}
												</TableCell>
											</TableRow>
										);
									}
									return filtered.map((row, index) => (
										<TableRow key={index}>
											<TableCell
												sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
											>
												{row.faDrug}
											</TableCell>
											<TableCell
												align='right'
												sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
											>
												{row.MaxAssistance
													? parseFloat(row.MaxAssistance).toLocaleString()
													: '0'}
											</TableCell>
										</TableRow>
									));
								})()
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Drug Pricing Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2,
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
							textTransform: 'uppercase',
						}}
					>
						Drug Pricing Table
					</Typography>

					{payorCostData?.uniquePayors && (
						<FormControl
							size='small'
							sx={{ minWidth: 200 }}
						>
							<Select
								value={selectedPayor}
								onChange={(e) => {
									const newPayor = e.target.value;
									setSelectedPayor(newPayor);
									const items =
										payorCostData?.payors?.find((p) => p.name === newPayor)
											?.items || [];
									separatePayorItems(items);
								}}
								sx={{
									fontSize: '0.75rem',
									height: '32px',
									'& .MuiSelect-select': { py: 0.5 },
								}}
							>
								{payorCostData.uniquePayors.map((payor) => (
									<MenuItem
										key={payor}
										value={payor}
										sx={{ fontSize: '0.75rem' }}
									>
										{payor}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)}
				</Box>

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
									Expected Gram
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
									Cost Gram
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
									Profit
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{drugPricingItems.map((item, index) => (
								<TableRow key={index}>
									<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
										{item.cleanDrug}
									</TableCell>
									<TableCell
										align='right'
										sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
									>
										{formatValue(item.expectedGram)}
									</TableCell>
									<TableCell
										align='right'
										sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
									>
										{formatValue(item.costGram)}
									</TableCell>
									<TableCell
										align='right'
										sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
									>
										{formatValue(
											(item.expectedGram || 0) - (item.costGram || 0),
										)}
									</TableCell>
								</TableRow>
							))}
							{currentPayorItems.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										align='center'
										sx={{ py: 3, color: '#94a3b8' }}
									>
										No items found for selected payor.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Drug Cost Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 2,
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
							textTransform: 'uppercase',
						}}
					>
						Drug Cost Table
					</Typography>

					<FormControl
						size='small'
						sx={{ minWidth: 250 }}
					>
						<Select
							multiple
							value={selectedDrugs}
							onChange={(e) => setSelectedDrugs(e.target.value)}
							input={<OutlinedInput />}
							renderValue={(selected) =>
								selected.length > 0
									? `${selected.length} drug${selected.length > 1 ? 's' : ''} selected`
									: 'Select drugs'
							}
							displayEmpty
							sx={{
								fontSize: '0.75rem',
								minHeight: '32px',
								'& .MuiSelect-select': { py: 0.5 },
							}}
						>
							{drugPricingItems.map((item, idx) => (
								<MenuItem
									key={idx}
									value={item.cleanDrug}
									sx={{ fontSize: '0.75rem', py: 0.5 }}
								>
									<Checkbox
										checked={selectedDrugs.indexOf(item.cleanDrug) > -1}
										size='small'
									/>
									<ListItemText
										primary={item.cleanDrug}
										primaryTypographyProps={{ fontSize: '0.75rem' }}
									/>
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

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
									Quantity
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
									Expected
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
									Cost
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
									Profit
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{drugPricingItems
								.filter((item) => selectedDrugs.includes(item.cleanDrug))
								.map((item, index) => {
									const qty = drugQuantities[item.cleanDrug + '_' + index] ?? 1;
									const expected = ((item.expectedGram || 0) * qty).toFixed(2);
									const cost = ((item.costGram || 0) * qty).toFixed(2);
									const profit = (expected - cost).toFixed(2);
									return (
										<TableRow key={index}>
											<TableCell
												sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
											>
												{item.cleanDrug}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													color: '#64748b',
													borderColor: '#bfdbfe',
													py: 0.5,
												}}
											>
												<TextField
													type='number'
													variant='outlined'
													size='small'
													value={qty}
													onChange={(e) => {
														const val = parseFloat(e.target.value);
														setDrugQuantities((prev) => ({
															...prev,
															[item.cleanDrug + '_' + index]:
																val < 0 ? 0 : e.target.value,
														}));
													}}
													InputProps={{
														sx: {
															fontSize: '0.875rem',
															color: '#64748b',
															height: '32px',
															backgroundColor: '#f8fafc',
															'& fieldset': { borderColor: '#bfdbfe' },
															'&:hover fieldset': {
																borderColor: '#3b82f6 !important',
															},
														},
														inputProps: { min: 0, step: 1 },
													}}
													sx={{ width: '80px', ml: 'auto' }}
												/>
											</TableCell>
											<TableCell
												align='right'
												sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
											>
												{expected}
											</TableCell>
											<TableCell
												align='right'
												sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
											>
												{cost}
											</TableCell>
											<TableCell
												align='right'
												sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
											>
												{profit}
											</TableCell>
										</TableRow>
									);
								})}
							{selectedDrugs.length > 0 &&
								(() => {
									const filteredDrugItems = drugPricingItems.filter((item) =>
										selectedDrugs.includes(item.cleanDrug),
									);
									const drugTotalExpected = filteredDrugItems.reduce(
										(sum, item, index) =>
											sum +
											(item.expectedGram || 0) *
												(drugQuantities[item.cleanDrug + '_' + index] ?? 1),
										0,
									);
									const drugTotalCost = filteredDrugItems.reduce(
										(sum, item, index) =>
											sum +
											(item.costGram || 0) *
												(drugQuantities[item.cleanDrug + '_' + index] ?? 1),
										0,
									);
									const drugTotalProfit = (
										drugTotalExpected - drugTotalCost
									).toFixed(2);
									return (
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
											<TableCell sx={{ borderColor: '#bfdbfe' }}></TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{drugTotalExpected.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{drugTotalCost.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{drugTotalProfit}
											</TableCell>
										</TableRow>
									);
								})()}
							{selectedDrugs.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										align='center'
										sx={{ py: 3, color: '#94a3b8' }}
									>
										Select drugs from the dropdown to view cost data.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Nursing Cost Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Nursing Cost Table
				</Typography>

				<TableContainer
					component={Paper}
					variant='outlined'
					sx={{ borderColor: '#bfdbfe', borderRadius: 'var(--radius-sm)' }}
				>
					<Table size='small'>
						<TableBody>
							<TableRow>
								<TableCell
									sx={{
										color: '#64748b',
										borderColor: '#bfdbfe',
										width: '40%',
									}}
								>
									Patient State
								</TableCell>
								<TableCell sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}>
									{formatValue(currentNursingDetails?.patient_state)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
									Therapy Type
								</TableCell>
								<TableCell sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}>
									{formatValue(currentNursingDetails?.therapy_type)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
									Expected Visit Duration
								</TableCell>
								<TableCell
									sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
								>
									<TextField
										type='number'
										variant='outlined'
										size='small'
										value={visitDuration}
										onChange={(e) => {
											const val = parseFloat(e.target.value);
											setVisitDuration(val < 1 ? 1 : e.target.value);
										}}
										InputProps={{
											sx: {
												fontSize: '0.875rem',
												color: '#64748b',
												height: '32px',
												backgroundColor: '#f8fafc',
												'& fieldset': { borderColor: '#bfdbfe' },
												'&:hover fieldset': {
													borderColor: '#3b82f6 !important',
												},
											},
											inputProps: { min: 1 },
										}}
										sx={{ width: '80px' }}
									/>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
									Nurse Home State
								</TableCell>
								<TableCell
									sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
								>
									<FormControl
										variant='outlined'
										size='small'
										sx={{ minWidth: '80px' }}
									>
										<Select
											value={selectedNurseState}
											onChange={(e) => {
												setSelectedNurseState(e.target.value);
												const match = nursingCostData.find(
													(n) => n.nurse_home_state === e.target.value,
												);
												setTravelTime(match?.travel_time ?? 1.0);
											}}
											sx={{
												fontSize: '0.875rem',
												color: '#64748b',
												height: '32px',
												backgroundColor: '#f8fafc',
												'& .MuiOutlinedInput-notchedOutline': {
													borderColor: '#bfdbfe',
												},
												'&:hover .MuiOutlinedInput-notchedOutline': {
													borderColor: '#3b82f6 !important',
												},
											}}
										>
											{nursingCostData.map((item, idx) => (
												<MenuItem
													key={idx}
													value={item.nurse_home_state}
													sx={{ fontSize: '0.875rem' }}
												>
													{item.nurse_home_state}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell sx={{ color: '#64748b', borderColor: '#bfdbfe' }}>
									Travel Time
								</TableCell>
								<TableCell
									sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
								>
									<TextField
										type='number'
										variant='outlined'
										size='small'
										value={travelTime}
										onChange={(e) => {
											const val = parseFloat(e.target.value);
											setTravelTime(val < 0 ? 0 : e.target.value);
										}}
										InputProps={{
											sx: {
												fontSize: '0.875rem',
												color: '#64748b',
												height: '32px',
												backgroundColor: '#f8fafc',
												'& fieldset': { borderColor: '#bfdbfe' },
												'&:hover fieldset': {
													borderColor: '#3b82f6 !important',
												},
											},
											inputProps: { min: 0, step: 0.1 },
										}}
										sx={{ width: '80px' }}
									/>
								</TableCell>
							</TableRow>
							<TableRow sx={{ backgroundColor: '#f2f6feff' }}>
								<TableCell
									sx={{
										fontWeight: 700,
										color: 'var(--color-primary)',
										borderColor: '#bfdbfe',
									}}
								>
									Estimated Cost to Serve
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: 'var(--color-primary)',
										borderColor: '#bfdbfe',
									}}
								>
									{formatValue(estimatedCost)}
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Final Nursing Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Final Nursing Table
				</Typography>

				<TableContainer
					component={Paper}
					variant='outlined'
					sx={{ borderColor: '#bfdbfe', borderRadius: 'var(--radius-sm)' }}
				>
					<Table size='small'>
						<TableHead>
							<TableRow sx={{ backgroundColor: '#fff' }}>
								<TableCell
									sx={{ borderColor: '#bfdbfe', width: '25%' }}
								></TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Quantity
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
									Enter Cost
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
									Expected
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
									Cost
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
									Profit
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{finalNursingItems.map((item, index) => {
								const label =
									item.hcpc === '99601' ? '99601 Quantity' : '99602 Hours';
								const qty = nursingQuantities[item.hcpc] ?? 1;
								const enteredCost =
									nursingCostInputs[item.hcpc] ?? item.costGram ?? 0;
								const expected = ((item.expectedGram || 0) * qty).toFixed(2);
								const cost = (parseFloat(enteredCost) * qty).toFixed(2);
								const profit = (expected - cost).toFixed(2);
								return (
									<TableRow key={index}>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											{label}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
										>
											<TextField
												type='number'
												variant='outlined'
												size='small'
												value={qty}
												onChange={(e) => {
													const val = parseFloat(e.target.value);
													setNursingQuantities((prev) => ({
														...prev,
														[item.hcpc]: val < 0 ? 0 : e.target.value,
													}));
												}}
												InputProps={{
													sx: {
														fontSize: '0.875rem',
														color: '#64748b',
														height: '32px',
														backgroundColor: '#f8fafc',
														'& fieldset': { borderColor: '#bfdbfe' },
														'&:hover fieldset': {
															borderColor: '#3b82f6 !important',
														},
													},
													inputProps: { min: 0, step: 1 },
												}}
												sx={{ width: '80px', ml: 'auto' }}
											/>
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
										>
											<TextField
												type='number'
												variant='outlined'
												size='small'
												value={enteredCost}
												onChange={(e) => {
													const val = parseFloat(e.target.value);
													setNursingCostInputs((prev) => ({
														...prev,
														[item.hcpc]: val < 0 ? 0 : e.target.value,
													}));
												}}
												InputProps={{
													sx: {
														fontSize: '0.875rem',
														color: '#64748b',
														height: '32px',
														backgroundColor: '#f8fafc',
														'& fieldset': { borderColor: '#bfdbfe' },
														'&:hover fieldset': {
															borderColor: '#3b82f6 !important',
														},
													},
													inputProps: { min: 0, step: 0.01 },
												}}
												sx={{ width: '80px', ml: 'auto' }}
											/>
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{expected}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{cost}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{profit}
										</TableCell>
									</TableRow>
								);
							})}
							{finalNursingItems.length > 0 &&
								(() => {
									const nursingTotalExpected = finalNursingItems.reduce(
										(sum, item) =>
											sum +
											(item.expectedGram || 0) *
												(nursingQuantities[item.hcpc] ?? 1),
										0,
									);
									const nursingTotalCost = finalNursingItems.reduce(
										(sum, item) =>
											sum +
											parseFloat(
												nursingCostInputs[item.hcpc] ?? item.costGram ?? 0,
											) *
												(nursingQuantities[item.hcpc] ?? 1),
										0,
									);
									const nursingTotalProfit = (
										nursingTotalExpected - nursingTotalCost
									).toFixed(2);
									return (
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
												colSpan={2}
												sx={{ borderColor: '#bfdbfe' }}
											></TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{nursingTotalExpected.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{nursingTotalCost.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{nursingTotalProfit}
											</TableCell>
										</TableRow>
									);
								})()}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Per Diem Table */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
					mb: 4,
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Per Diem Table
				</Typography>

				<TableContainer
					component={Paper}
					variant='outlined'
					sx={{ borderColor: '#bfdbfe', borderRadius: 'var(--radius-sm)' }}
				>
					<Table size='small'>
						<TableHead>
							<TableRow sx={{ backgroundColor: '#fff' }}>
								<TableCell
									sx={{ borderColor: '#bfdbfe', width: '25%' }}
								></TableCell>
								<TableCell
									align='right'
									sx={{
										fontWeight: 700,
										color: 'var(--color-text-main)',
										borderColor: '#bfdbfe',
										fontSize: '0.8rem',
									}}
								>
									Quantity
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
									Enter Cost
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
									Expected
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
									Cost
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
									Profit
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{perDiemItems.map((item, index) => {
								const qty = perDiemQuantities[index] ?? 1;
								const enteredCost =
									perDiemCostInputs[index] ?? item.costGram ?? 0;
								const expected = ((item.expectedGram || 0) * qty).toFixed(2);
								const cost = (parseFloat(enteredCost) * qty).toFixed(2);
								const profit = (expected - cost).toFixed(2);
								return (
									<TableRow key={index}>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											{item.cleanDrug}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
										>
											<TextField
												type='number'
												variant='outlined'
												size='small'
												value={qty}
												onChange={(e) => {
													const val = parseFloat(e.target.value);
													setPerDiemQuantities((prev) => ({
														...prev,
														[index]: val < 0 ? 0 : e.target.value,
													}));
												}}
												InputProps={{
													sx: {
														fontSize: '0.875rem',
														color: '#64748b',
														height: '32px',
														backgroundColor: '#f8fafc',
														'& fieldset': { borderColor: '#bfdbfe' },
														'&:hover fieldset': {
															borderColor: '#3b82f6 !important',
														},
													},
													inputProps: { min: 0, step: 1 },
												}}
												sx={{ width: '80px', ml: 'auto' }}
											/>
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#64748b', borderColor: '#bfdbfe', py: 0.5 }}
										>
											<TextField
												type='number'
												variant='outlined'
												size='small'
												value={enteredCost}
												onChange={(e) => {
													const val = parseFloat(e.target.value);
													setPerDiemCostInputs((prev) => ({
														...prev,
														[index]: val < 0 ? 0 : e.target.value,
													}));
												}}
												InputProps={{
													sx: {
														fontSize: '0.875rem',
														color: '#64748b',
														height: '32px',
														backgroundColor: '#f8fafc',
														'& fieldset': { borderColor: '#bfdbfe' },
														'&:hover fieldset': {
															borderColor: '#3b82f6 !important',
														},
													},
													inputProps: { min: 0, step: 0.01 },
												}}
												sx={{ width: '80px', ml: 'auto' }}
											/>
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{expected}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{cost}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{profit}
										</TableCell>
									</TableRow>
								);
							})}
							{perDiemItems.length > 0 &&
								(() => {
									const perDiemTotalExpected = perDiemItems.reduce(
										(sum, item, i) =>
											sum +
											(item.expectedGram || 0) * (perDiemQuantities[i] ?? 1),
										0,
									);
									const perDiemTotalCost = perDiemItems.reduce(
										(sum, item, i) =>
											sum +
											parseFloat(perDiemCostInputs[i] ?? item.costGram ?? 0) *
												(perDiemQuantities[i] ?? 1),
										0,
									);
									const perDiemTotalProfit = (
										perDiemTotalExpected - perDiemTotalCost
									).toFixed(2);
									return (
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
												colSpan={2}
												sx={{ borderColor: '#bfdbfe' }}
											></TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{perDiemTotalExpected.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{perDiemTotalCost.toFixed(2)}
											</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 700,
													color: '#94a3b8',
													borderColor: '#bfdbfe',
												}}
											>
												{perDiemTotalProfit}
											</TableCell>
										</TableRow>
									);
								})()}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Grand Total Summary Card */}
			{(() => {
				// Drug Cost totals
				const filteredDrugItems = drugPricingItems.filter((item) =>
					selectedDrugs.includes(item.cleanDrug),
				);
				const drugTotalExpected = filteredDrugItems.reduce(
					(sum, item, index) =>
						sum +
						(item.expectedGram || 0) *
							(drugQuantities[item.cleanDrug + '_' + index] ?? 1),
					0,
				);
				const drugTotalCost = filteredDrugItems.reduce(
					(sum, item, index) =>
						sum +
						(item.costGram || 0) *
							(drugQuantities[item.cleanDrug + '_' + index] ?? 1),
					0,
				);
				// Final Nursing totals
				const nursingTotalExpected = finalNursingItems.reduce(
					(sum, item) =>
						sum +
						(item.expectedGram || 0) * (nursingQuantities[item.hcpc] ?? 1),
					0,
				);
				const nursingTotalCost = finalNursingItems.reduce(
					(sum, item) =>
						sum +
						parseFloat(nursingCostInputs[item.hcpc] ?? item.costGram ?? 0) *
							(nursingQuantities[item.hcpc] ?? 1),
					0,
				);
				// Per Diem totals
				const perDiemTotalExpected = perDiemItems.reduce(
					(sum, item, i) =>
						sum + (item.expectedGram || 0) * (perDiemQuantities[i] ?? 1),
					0,
				);
				const perDiemTotalCost = perDiemItems.reduce(
					(sum, item, i) =>
						sum +
						parseFloat(perDiemCostInputs[i] ?? item.costGram ?? 0) *
							(perDiemQuantities[i] ?? 1),
					0,
				);
				// Grand totals
				const grandTotalExpected =
					drugTotalExpected + nursingTotalExpected + perDiemTotalExpected;
				const grandTotalCost =
					drugTotalCost + nursingTotalCost + perDiemTotalCost;
				const grandTotalProfit = grandTotalExpected - grandTotalCost;
				const grandMargin =
					grandTotalExpected > 0
						? ((grandTotalProfit / grandTotalExpected) * 100).toFixed(2)
						: '0.00';
				return (
					<Paper
						variant='outlined'
						sx={{
							borderRadius: 'var(--radius-md)',
							borderColor: 'var(--color-primary)',
							padding: '24px',
							backgroundColor: '#f0f7ff',
							mb: 4,
						}}
					>
						<Typography
							variant='subtitle2'
							sx={{
								color: 'var(--color-primary)',
								fontWeight: 700,
								mb: 2,
								letterSpacing: '0.01em',
								fontSize: '0.8rem',
								display: 'inline-block',
								borderBottom: '2px solid var(--color-primary)',
								paddingBottom: '2px',
								textTransform: 'uppercase',
							}}
						>
							Grand Total Summary
						</Typography>
						<TableContainer
							component={Paper}
							variant='outlined'
							sx={{
								borderColor: 'var(--color-primary)',
								borderRadius: 'var(--radius-sm)',
								backgroundColor: '#fff',
							}}
						>
							<Table size='small'>
								<TableHead>
									<TableRow sx={{ backgroundColor: '#e8f0fe' }}>
										<TableCell
											sx={{
												fontWeight: 700,
												color: 'var(--color-text-main)',
												borderColor: '#bfdbfe',
												fontSize: '0.8rem',
												width: '40%',
											}}
										>
											Source
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
											Expected
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
											Cost
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
											Profit
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											Drug Cost
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{drugTotalExpected.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{drugTotalCost.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{(drugTotalExpected - drugTotalCost).toFixed(2)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											Final Nursing
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{nursingTotalExpected.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{nursingTotalCost.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{(nursingTotalExpected - nursingTotalCost).toFixed(2)}
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											Per Diem
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{perDiemTotalExpected.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{perDiemTotalCost.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{(perDiemTotalExpected - perDiemTotalCost).toFixed(2)}
										</TableCell>
									</TableRow>
									<TableRow sx={{ backgroundColor: '#e8f0fe' }}>
										<TableCell
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
											}}
										>
											Grand Total
										</TableCell>
										<TableCell
											align='right'
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
											}}
										>
											{grandTotalExpected.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
											}}
										>
											{grandTotalCost.toFixed(2)}
										</TableCell>
										<TableCell
											align='right'
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
											}}
										>
											{grandTotalProfit.toFixed(2)}
										</TableCell>
									</TableRow>
									<TableRow sx={{ backgroundColor: '#dbeafe' }}>
										<TableCell
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
											}}
										>
											Margin
										</TableCell>
										<TableCell
											colSpan={3}
											align='right'
											sx={{
												fontWeight: 700,
												color: 'var(--color-primary)',
												borderColor: '#bfdbfe',
												fontSize: '1rem',
											}}
										>
											{grandMargin}%
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				);
			})()}

			{/* Provider Profitability Section */}
			<Paper
				variant='outlined'
				sx={{
					borderRadius: 'var(--radius-md)',
					borderColor: '#bfdbfe',
					padding: '24px',
					backgroundColor: '#fff',
				}}
			>
				<Typography
					variant='subtitle2'
					sx={{
						color: 'var(--color-primary)',
						fontWeight: 700,
						mb: 2,
						letterSpacing: '0.01em',
						fontSize: '0.8rem',
						display: 'inline-block',
						borderBottom: '2px solid var(--color-primary)',
						paddingBottom: '2px',
						textTransform: 'uppercase',
					}}
				>
					Provider Profitability (Trailing 6 Months) Table
				</Typography>

				<Grid
					container
					spacing={2}
				>
					<Grid
						item
						xs={12}
					>
						<Paper
							variant='outlined'
							sx={{
								borderRadius: 'var(--radius-sm)',
								borderColor: '#bfdbfe',
								overflow: 'hidden',
								maxWidth: '600px',
							}}
						>
							<Grid
								container
								alignItems='center'
							>
								<Grid
									item
									sx={{
										backgroundColor: '#f8fafc',
										padding: '8px 16px',
										borderRight: '1px solid #bfdbfe',
										minWidth: '150px',
									}}
								>
									<Typography
										variant='caption'
										sx={{ fontWeight: 700, color: 'var(--color-text-main)' }}
									>
										Provider NPI
									</Typography>
								</Grid>
								<Grid
									item
									xs
								>
									<TextField
										fullWidth
										variant='standard'
										value={npiSearch}
										placeholder='Enter NPI to search'
										onChange={(e) => {
											const val = e.target.value;
											setNpiSearch(val);
											const match = providerProfitabilityData.filter(
												(p) => p.NPI === val,
											);
											setMatchedProvider(match.length > 0 ? match : null);
										}}
										InputProps={{
											disableUnderline: true,
											sx: { px: 2, fontSize: '0.8rem', color: '#64748b' },
										}}
									/>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</Grid>

				{matchedProvider && (
					<TableContainer
						component={Paper}
						variant='outlined'
						sx={{
							borderColor: '#bfdbfe',
							borderRadius: 'var(--radius-sm)',
							mt: 2,
						}}
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
										Payor Type
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
										Referral
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
										SOC
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
										Expected
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
										COGS
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
										GM
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
										GM%
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{matchedProvider.map((row, index) => (
									<TableRow key={index}>
										<TableCell
											sx={{ color: '#64748b', borderColor: '#bfdbfe' }}
										>
											{row.Payor_Type}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{row.Referral}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{row.SOC}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{formatValue(row.Expected)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{formatValue(row.COGS)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{formatValue(row.GM)}
										</TableCell>
										<TableCell
											align='right'
											sx={{ color: '#94a3b8', borderColor: '#bfdbfe' }}
										>
											{(row.GMPerCent * 100).toFixed(2)}%
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{npiSearch && !matchedProvider && (
					<Typography sx={{ mt: 2, color: '#94a3b8', fontSize: '0.85rem' }}>
						No provider found for NPI "{npiSearch}"
					</Typography>
				)}
			</Paper>
		</Box>
	);
};

export default Margin;
