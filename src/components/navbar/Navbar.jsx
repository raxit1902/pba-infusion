import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

function Navbar() {
	const user = {
		name: 'Tom Cruise',
		role: 'Admin',
		avatar: '',
	};
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
						<Tooltip>
							<IconButton sx={{ p: 0 }}>
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
					</Box>
				</Toolbar>
			</div>
		</AppBar>
	);
}

export default Navbar;
