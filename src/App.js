import './App.css';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/navbar/Navbar.jsx';

function App() {
	// You can add authentication logic here to determine if user is logged in
	const isAuthenticated = false; // Change this based on your auth logic

	return (
		<Router>
			{/* Navbar - Common across all pages */}
			<Navbar />

			<Routes>
				{/* Dashboard Route - Protected */}
				<Route
					path='/dashboard'
					element={<Dashboard />}
				/>

				{/* Default Route - Redirect to Dashboard */}
				<Route
					path='/'
					element={
						<Navigate
							to='/dashboard'
							replace
						/>
					}
				/>

				{/* Catch all - Redirect to Dashboard */}
				<Route
					path='*'
					element={
						<Navigate
							to='/dashboard'
							replace
						/>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
