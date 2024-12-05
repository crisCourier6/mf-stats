import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, Snackbar, SnackbarCloseReason, Alert, TableContainer, Table, TableHead, TableRow, 
    TableCell, Paper, TableBody, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditIcon from '@mui/icons-material/Edit';
import { Stat } from '../interfaces/Stat';
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserHasStat } from '../interfaces/UserHasStat';
import api from '../api';

const StatsDetails: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const {id }= useParams()
    const statsURL = "/stats"
    const userStatsURL = "/users-stats"
    const [stat, setStat] = useState<Stat|null>(null)
    const [userStats, setUserStats] = useState<UserHasStat[]>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    const [selectedUserStat, setSelectedUserStat] = useState<UserHasStat | null>(null)
    const [showChart, setShowChart] = useState(false); // State to toggle the chart
    const [newEntryValue, setNewEntryValue] = useState<string>('');
    const [editEntryValue, setEditEntryValue] = useState<string>('');

    useEffect(() => {
        document.title = `Medidas - EyesFood`
        let userStatsQueryParams = `?u=${currentUserId}&s=${id}`
        const fetchStat = api.get(`${statsURL}/${id}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })

        const fetchUserStats = api.get(`${userStatsURL}${userStatsQueryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })

        Promise.all([fetchStat, fetchUserStats])
        .then(([statResponse, userStatsResponse]) => {
            const formattedUserStats = userStatsResponse.data.map((userStat: UserHasStat) => ({
                ...userStat,
                value: statResponse.data.valueType==="number" ? parseFloat(userStat.value as string) : userStat.value,
                createdAt: dayjs(userStat.createdAt).format('DD/MM/YYYY') // Formatting the date
            }));
            setStat(statResponse.data)
            setUserStats(formattedUserStats)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            setAllDone(true); // Set the flag after both requests have completed
        });
    }, []);

    
    const handleSnackbarClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
      ) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
      }

    const handleShowChart = () => {
        setShowChart(prev => !prev);
    };

    const handleOpenDeleteDialog = (userStat: UserHasStat) => {
        setSelectedUserStat(userStat)
        setShowDeleteDialog(true)
    }

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false)
    }

    const handleOpenEditDialog = (userStat: UserHasStat) => {
        setSelectedUserStat(userStat)
        setEditEntryValue(userStat.value.toString())
        setShowEditDialog(true)
    }

    const handleCloseEditDialog = () => {
        setShowEditDialog(false)
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (stat?.valueType==="number") {
            const decimalPlaces = stat.decimals; // Get the number of decimals allowed from stat

            // Allow empty input in addition to the regular expression for valid numbers
            // The regex allows for numbers with the specified number of decimal places
            const regex = new RegExp(`^\\d*(?:[.,]\\d{0,${decimalPlaces}})?$`);

            // Allow setting the value if it's valid or if it's empty (to allow deletions)
            if (regex.test(value) || value === "") {
                setNewEntryValue(value);
            }
        }
        else{
            setNewEntryValue(value);
        }
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (stat?.valueType==="number") {
            const decimalPlaces = stat.decimals; // Get the number of decimals allowed from stat

            // Allow empty input in addition to the regular expression for valid numbers
            // The regex allows for numbers with the specified number of decimal places
            const regex = new RegExp(`^\\d*(?:[.,]\\d{0,${decimalPlaces}})?$`);

            // Allow setting the value if it's valid or if it's empty (to allow deletions)
            if (regex.test(value) || value === "") {
                setEditEntryValue(value);
            }
        }
        else{
            setEditEntryValue(value);
        }
    };

    const submitNew = () => {
        // Logic to submit new userHasStat entry
        const normalizedValue = newEntryValue.replace(',', '.');
        const newUserStat = {
            userId: currentUserId,
            statId: stat?.id,
            value: normalizedValue,
        };

        api.post(userStatsURL, newUserStat, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            // Refresh user stats or handle success
            const formattedNewStat = {
                ...res.data,
                createdAt: dayjs(res.data.createdAt).format('DD/MM/YYYY'), // Format the createdAt date
            };
            setUserStats(prev => [...prev, formattedNewStat]); // Append new entry to state
            setSnackbarMsg("Registro agregado")
        })
        .catch(error => {
            console.error("Error adding new stat entry:", error);
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=>{
            setSnackbarOpen(true)
            setNewEntryValue("")
        })
    };

    const submitEdit = () => {
        // Logic to submit new userHasStat entry
        const normalizedValue = editEntryValue.replace(',', '.');
        const newUserStat = {
            value: normalizedValue,
        };

        api.patch(`${userStatsURL}/${selectedUserStat?.id}`, newUserStat, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            // Refresh user stats or handle success
            const formattedNewStat = {
                ...res.data,
                createdAt: dayjs(res.data.createdAt).format('DD/MM/YYYY'), // Format the createdAt date
            };
            setUserStats((prevStats) => 
                prevStats.map((userStat) =>
                    userStat.id===formattedNewStat.id ? formattedNewStat : userStat
                )
            )
            setSnackbarMsg("Registro modificado")
        })
        .catch(error => {
            console.error("Error adding new stat entry:", error);
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=>{
            setSnackbarOpen(true)
            handleCloseEditDialog()
        })
    };

    const submitDelete = () => {
        // Logic to submit new userHasStat entry
        api.delete(`${userStatsURL}/${selectedUserStat?.id}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            // Refresh user stats or handle success
            setUserStats(prev => prev.filter(userStat => 
                userStat.id !== selectedUserStat?.id
            )); // Append new entry to state
            setSnackbarMsg("Registro eliminado")
        })
        .catch(error => {
            console.error("Error deleting entry:", error);
            setSnackbarMsg(error.response.data.message)
        })
        .finally(()=>{
            setSnackbarOpen(true)
            handleCloseDeleteDialog()
        })
    };

    return ( allDone?
        <Grid container display="flex" 
        flexDirection="column" 
        justifyContent="center"
        alignItems="center"
        sx={{width: "100vw", maxWidth:"500px", gap:2, flexWrap: "wrap", pb: 7}}
        >   
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMsg}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
            <Box 
                sx={{
                    position: 'sticky',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    maxWidth: "500px",
                    transition: "top 0.1s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderBottom: "5px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box"
                  }}
            >
                <Typography variant='h5' width="100%"  color="primary.contrastText" sx={{py:1, borderLeft: "3px solid",
                    borderRight: "3px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box",
                }}>
                    {stat?.name}
                </Typography>
            </Box> 
            <Box sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}>
                <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                    <Table aria-label="user stats table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{bgcolor: "primary.main"}}>
                                    <Typography variant="subtitle1" sx={{color: "primary.contrastText"}}>
                                        Fecha
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{bgcolor: "primary.main"}} align="center">
                                    <Typography variant="subtitle1" sx={{color: "primary.contrastText"}}>
                                        Valor ({stat?.unit})
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{bgcolor: "primary.main"}}>
                                    <Typography variant="subtitle1" sx={{color: "primary.contrastText"}}>
                                        Acciones
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userStats.map((userStat, index) => (
                                <TableRow key={userStat.id} sx={{ height: 30,  bgcolor: index % 2 === 0 ? "transparent" : "secondary.light"  }}>
                                    <TableCell component="th" scope="row" sx={{ padding: '4px 8px' }}>
                                        {/* Format the date */}
                                        {userStat.createdAt.toString()}
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                        {userStat.value}
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                        <IconButton color='primary' size="small" onClick={()=>handleOpenEditDialog(userStat)}>
                                            <EditIcon sx={{fontSize: {xs:16, sm:20}}} />
                                        </IconButton>
                                        <IconButton color='error' size="small" onClick={()=>handleOpenDeleteDialog(userStat)}>
                                            <DeleteForeverRoundedIcon sx={{fontSize: {xs:16, sm:20}}}/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: "column", mb: 2, gap:2, width: "90%" }}>
                    <Typography variant="h6">Agregar nuevo registro</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: "center", flexDirection: "row", gap:1 }}>
                        <TextField
                            label={`Valor (${stat?.unit})`}
                            value={newEntryValue}
                            onChange={handleInputChange}
                            variant="outlined"   
                            fullWidth
                        />
                        <Button variant="contained" color="primary" disabled={newEntryValue===""} onClick={submitNew}>
                            Agregar
                        </Button>
                    </Box>
                    
                    
                </Box>
                
            <Button variant='contained' disabled={stat?.valueType==="string"} onClick={handleShowChart}>
                {showChart ? "Ocultar gráfico" : "Mostrar gráfico"}
            </Button>

            {/* Chart rendering */}
            {showChart && (
                <ResponsiveContainer width="90%" height={300}>
                    <LineChart data={userStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="createdAt"/>
                        <YAxis 
                            domain={['dataMin - 5', 'dataMax + 5']}  // Add some padding to avoid empty space
                            unit={stat?.unit} 
                            padding={{ top: 10, bottom: 10 }}  // Adjusting the padding for better spacing
                        />
                        <Tooltip
                            formatter={(value) => [`${value} ${stat?.unit}`, 'peso']}  // Customizing the tooltip
                            labelFormatter={(label) => `Fecha: ${label}`}  // Customizing the X-axis label in the tooltip
                        />
                        <Legend />
                        <Line type="monotone" dataKey="value" name={stat?.name} stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
             <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle>Borrar registro {selectedUserStat?.value} {stat?.unit}</DialogTitle>
                <DialogContent>
                    ¿Seguro que desea borrar este registro?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={submitDelete} variant="contained" color="primary">
                        Borrar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showEditDialog} onClose={()=> setShowEditDialog(false)} 
            PaperProps={{
                sx: {
                    maxHeight: '80vh', 
                    width: "85vw",
                    maxWidth: "450px"
                }
            }} >
                <DialogTitle sx={{bgcolor: "primary.dark", color: "primary.contrastText"}}>
                    Modificar registro
                </DialogTitle>
                <DialogContent sx={{
                    padding:0.5,
                    flex: 1, 
                    overflowY: 'auto',
                    display: "flex",
                    justifyContent: "center"
                }}>
                    <TextField
                        label={`Valor (${stat?.unit})`}
                        value={editEntryValue}
                        onChange={handleEditChange}
                        variant="outlined"   
                        sx={{ width:100, mt:2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" disabled={editEntryValue===""} onClick={submitEdit}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>    
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default StatsDetails;