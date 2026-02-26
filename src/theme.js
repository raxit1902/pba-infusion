import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	typography: {
		fontFamily: '"Montserrat", sans-serif',
	},
	palette: {
		primary: {
			main: '#0b77c5', // Matches --color-primary
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
				},
			},
		},
	},
});

export default theme;
