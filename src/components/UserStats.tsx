import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Card, CardContent, Grid, Typography, Button, Snackbar, SnackbarCloseReason, CardActions, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Stat } from '../interfaces/Stat';
import NavigateBack from './NavigateBack';

const UserStats: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const navigate = useNavigate()
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const statsURL = "/stats"
    const [stats, setStats] = useState<Stat[]>([])
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    

    useEffect(() => {
        document.title = `Medidas - EyesFood`
        let queryParams = `?u=${currentUserId}`
        api.get(`${statsURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setStats(res.data)
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
                <Alert variant="filled" onClose={handleSnackbarClose} severity={snackbarMsg.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
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
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottom: "5px solid",
                    borderLeft: "5px solid",
                    borderRight: "5px solid",
                    borderColor: "secondary.main",
                    color: "primary.contrastText",
                    boxSizing: "border-box"
                  }}
            >
                    <Box sx={{display: "flex", flex: 1}}>
                        <NavigateBack/>
                    </Box>
                    <Box sx={{display: "flex", flex: 6}}>
                        <Typography variant='h6' width="100%"  color="primary.contrastText" sx={{py:1}}>
                            Mis medidas
                        </Typography>
                    </Box>
                    <Box sx={{display: "flex", flex: 1}}></Box>
            </Box> 

            { stats.map((stat)=>{
                return (
                <Card key={stat.id} sx={{
                border: "4px solid", 
                borderColor: "primary.dark", 
                bgcolor: "primary.contrastText",
                width:"90%", 
                height: "20vh",
                maxHeight: "120px", 
                minHeight: "40px",
                display:"flex",
                flexDirection: "column"
                }}>
                    <CardContent sx={{
                    width:"100%",
                    height: "75%", 
                    display:"flex", 
                    flexDirection: "column", 
                    justifyContent: "center",
                    alignItems: "center",
                    padding:0,
                    }}>
                        <Box sx={{
                            width:"100%", 
                            height: "100%",
                            display:"flex", 
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}>
                            <Typography 
                                variant="h6" 
                                color="secondary.contrastText"
                                width="100%" 
                                sx={{textAlign: "center",
                                    borderBottom: "2px solid", 
                                    borderColor: "primary.dark", 
                                    bgcolor: "secondary.main"
                                }}
                                >
                                 {`${stat.name} (${stat.unit})`}
                            </Typography>
                            <Typography 
                            variant='subtitle2' 
                            color= "primary.dark" 
                            width={"100%"}
                            sx={{
                                textAlign:"center", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                display: "flex", 
                                gap:1,
                                fontWeight: "bold"
                            }}>
                                {stat.description}
                            </Typography>       
                            <Typography 
                            variant='subtitle2' 
                            color= "primary.dark" 
                            width={"100%"}
                            sx={{
                                textAlign:"right", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                display: "flex", 
                                gap:1,
                                fontStyle: "italic"
                            }}>
                                {stat.userHasStat.length} {stat.userHasStat.length==1?<>registro</>:<>registros</>}
                            </Typography>         
                        </Box>
                    </CardContent>
                    <CardActions sx={{padding:0, width:"100%", height: "25%"}}>
                        <Box sx={{
                        width:"100%", 
                        display:"flex", 
                        height: "100%",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "primary.dark",
                        }}>
                            <Button onClick={()=>navigate(stat.id)}
                                variant="text"
                                sx={{ color: "secondary.main", fontSize: 15, padding: 0 }}>
                                Ver más
                            </Button>
                        </Box>
                    </CardActions>
                </Card> 
            )}
        )}
        </Grid>
        
        :<CircularProgress/>   
    )
}

export default UserStats;