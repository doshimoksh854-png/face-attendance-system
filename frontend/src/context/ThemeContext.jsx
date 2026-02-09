import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        // Get saved theme from localStorage or default to 'light'
        return localStorage.getItem('themeMode') || 'light';
    });

    useEffect(() => {
        // Save theme preference to localStorage
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode colors
                            primary: {
                                main: '#1976d2',
                            },
                            secondary: {
                                main: '#dc004e',
                            },
                            background: {
                                default: '#f5f5f5',
                                paper: '#ffffff',
                            },
                        }
                        : {
                            // Dark mode colors
                            primary: {
                                main: '#90caf9',
                            },
                            secondary: {
                                main: '#f48fb1',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1e1e1e',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                },
            }),
        [mode]
    );

    const value = {
        mode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
