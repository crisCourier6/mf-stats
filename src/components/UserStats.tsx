import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Grid, Typography, Button, Snackbar, SnackbarCloseReason, CardActions, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from "@mui/material";
import { Stat } from '../interfaces/Stat';
import { truncate } from 'fs';
import dayjs from 'dayjs';

const UserStats: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const navigate = useNavigate()
    const currentUserId = window.localStorage.getItem("id")
    const statsURL = "http://192.168.100.6:8080/stats"
    const [stats, setStats] = useState<Stat[]>([])
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [allDone, setAllDone] = useState(false)
    

    useEffect(() => {
        document.title = `Medidas - EyesFood`
        let queryParams = `?u=${currentUserId}`
        axios.get(`${statsURL}${queryParams}`, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(res => {
            console.log(res.data)
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
                    Medidas
                </Typography>
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