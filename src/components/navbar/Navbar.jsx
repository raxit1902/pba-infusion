import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';

function Navbar() {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const user = {
		name: 'Tom Cruise',
		role: 'Admin',
		avatar: '',
		email: 'tom.cruise@example.com',
		employeeId: 'EMP-20234',
		department: 'Clinical Operations',
		phone: '+1 (555) 234-5678',
	};

	const handleOpenFlyout = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseFlyout = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<AppBar position='sticky'>
			<div className='layout-container'>
				<Toolbar disableGutters>
					<Typography
						variant='h6'
						noWrap
						component='a'
						href='/'
						sx={{
							mr: 2,
							display: { xs: 'none', md: 'flex' },
							fontWeight: 600,
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						Patient Benefit Analytics Tool
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}></Box>
					<Typography
						variant='h5'
						noWrap
						component='a'
						href='#app-bar-with-responsive-menu'
						sx={{
							mr: 2,
							display: { xs: 'flex', md: 'none' },
							flexGrow: 1,
							fontWeight: 700,
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						PBA Tool
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}></Box>
					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title='Profile'>
							<IconButton
								sx={{ p: 0 }}
								onClick={handleOpenFlyout}
							>
								<Stack
									direction='row'
									alignItems='center'
									spacing={1}
									sx={{
										border: '1px solid var(--color-border)',
										borderRadius: '30px',
										padding: '4px 4px 4px 12px',
										backgroundColor: 'var(--color-bg-card)',
										transition: 'all 0.2s ease',
										'&:hover': {
											backgroundColor: 'var(--color-bg-alt)',
											borderColor: 'var(--color-primary-shadow)',
											boxShadow: 'var(--shadow-sm)',
										},
									}}
								>
									<Stack
										sx={{
											display: { xs: 'none', md: 'flex' },
											textAlign: 'right',
											mr: 0.5,
										}}
									>
										<Typography
											variant='subtitle2'
											sx={{
												color: 'var(--color-text-main)',
												fontWeight: 600,
												lineHeight: 1.2,
											}}
										>
											{user.name}
										</Typography>
										<Typography
											variant='caption'
											sx={{
												color: 'var(--color-text-muted)',
												lineHeight: 1,
											}}
										>
											{user.role}
										</Typography>
									</Stack>
									<Avatar
										alt={user.name}
										sx={{
											bgcolor: 'var(--color-primary)',
											width: 36,
											height: 36,
											fontSize: '0.9rem',
										}}
									>
										{user.avatar ? (
											<Avatar
												src={user.avatar}
												alt={user.name}
											/>
										) : (
											user.name
												.split(' ')
												.map((n) => n[0])
												.join('')
										)}
									</Avatar>
								</Stack>
							</IconButton>
						</Tooltip>

						{/* Profile Flyout */}
						<Popover
							open={open}
							anchorEl={anchorEl}
							onClose={handleCloseFlyout}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							slotProps={{
								paper: {
									sx: {
										mt: 1.5,
										borderRadius: '12px',
										minWidth: 300,
										boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
										border: '1px solid var(--color-border)',
										overflow: 'hidden',
									},
								},
							}}
						>
							{/* Header */}
							<Box
								sx={{
									background:
										'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-shadow) 100%)',
									px: 3,
									py: 2.5,
									display: 'flex',
									alignItems: 'center',
									gap: 2,
								}}
							>
								<Avatar
									alt={user.name}
									sx={{
										bgcolor: 'rgba(255,255,255,0.2)',
										color: '#fff',
										width: 52,
										height: 52,
										fontSize: '1.2rem',
										fontWeight: 700,
										border: '2px solid rgba(255,255,255,0.4)',
									}}
								>
									{user.name
										.split(' ')
										.map((n) => n[0])
										.join('')}
								</Avatar>
								<Stack>
									<Typography
										variant='subtitle1'
										sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.3 }}
									>
										{user.name}
									</Typography>
									<Typography
										variant='caption'
										sx={{
											color: 'rgba(255,255,255,0.85)',
											fontWeight: 500,
											fontSize: '0.8rem',
										}}
									>
										{user.role}
									</Typography>
								</Stack>
							</Box>

							{/* Details */}
							<Box sx={{ px: 3, py: 2 }}>
								<Stack spacing={1.5}>
									<Stack
										direction='row'
										alignItems='center'
										spacing={1.5}
									>
										<EmailOutlinedIcon
											sx={{ fontSize: 18, color: 'var(--color-text-muted)' }}
										/>
										<Typography
											variant='body2'
											sx={{ color: 'var(--color-text-main)' }}
										>
											{user.email}
										</Typography>
									</Stack>
								</Stack>
							</Box>

							<Divider />

							{/* Footer */}
							<Box sx={{ px: 3, py: 1.5 }}>
								<Button
									fullWidth
									startIcon={<LogoutIcon />}
									sx={{
										justifyContent: 'flex-start',
										color: 'var(--color-text-muted)',
										textTransform: 'none',
										fontWeight: 500,
										'&:hover': {
											backgroundColor: 'rgba(211, 47, 47, 0.08)',
											color: '#d32f2f',
										},
									}}
								>
									Sign Out
								</Button>
							</Box>
						</Popover>
					</Box>
				</Toolbar>
			</div>
		</AppBar>
	);
}

export default Navbar;
