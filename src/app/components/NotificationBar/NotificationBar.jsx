import {
    Badge,
    Button,
    Card,
    Drawer,
    Icon,
    IconButton,
    ThemeProvider,
} from '@mui/material';
import { Box, styled, useTheme } from '@mui/system';
import useNotification from 'app/hooks/useNotification';
import useSettings from 'app/hooks/useSettings';
import { sideNavWidth, topBarHeight } from 'app/utils/constant';
import { getTimeDifference } from 'app/utils/utils.js';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { themeShadows } from '../MatxTheme/themeColors';
import { Paragraph, Small } from '../Typography';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
const Notification = styled('div')(() => ({
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    height: topBarHeight,
    boxShadow: themeShadows[6],
    '& h5': {
        marginLeft: '8px',
        marginTop: 0,
        marginBottom: 0,
        fontWeight: '500',
    },
}));

const NotificationCard = styled(Box)(({ theme }) => ({
    position: 'relative',
    '&:hover': {
        '& .messageTime': {
            display: 'none',
        },
        '& .deleteButton': {
            opacity: '1',
        },
    },
    '& .messageTime': {
        color: theme.palette.text.secondary,
    },
    '& .icon': { fontSize: '1.25rem' },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
    opacity: '0',
    position: 'absolute',
    right: 5,
    marginTop: 9,
    marginRight: '24px',
    background: 'rgba(0, 0, 0, 0.01)',
}));

const CardLeftContent = styled('div')(({ theme }) => ({
    padding: '12px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0, 0, 0, 0.01)',
    '& small': {
        fontWeight: '500',
        marginLeft: '16px',
        color: theme.palette.text.secondary,
    },
}));

const Heading = styled('span')(({ theme }) => ({
    fontWeight: '500',
    marginLeft: '16px',
    color: theme.palette.text.secondary,
}));
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const NotificationBar = ({ container }) => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    let onConnected = () => {
        client.subscribe('/topic/server', function (msg) {
            if (msg.body) {
                setMessage(msg.body);
            }
        });
        client.subscribe('/topic/error', function (msg) {
            if (msg.body) {
                setMessage(msg.body);
            }
        });
    };

    let onDisconnected = () => {
        console.log('Disconnected!!');
    };
    const client = new Client({
        brokerURL: SOCKET_URL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: onConnected,
        onDisconnect: onDisconnected,
        onWebSocketError: () => {
            navigate('/session/502');
        },
    });

    useEffect(() => {
        client.activate();
        getNotifications();
        // eslint-disable-next-line
    }, [message]);

    const { settings } = useSettings();
    const theme = useTheme();
    const secondary = theme.palette.text.secondary;
    const [panelOpen, setPanelOpen] = React.useState(false);
    const {
        deleteNotification,
        clearNotifications,
        getNotifications,
        notifications,
    } = useNotification();

    const handleDrawerToggle = () => {
        setPanelOpen(!panelOpen);
    };

    const { palette } = useTheme();
    const textColor = palette.text.primary;

    return (
        <Fragment>
            <IconButton onClick={handleDrawerToggle}>
                <Badge color="secondary" badgeContent={notifications?.length}>
                    <Icon sx={{ color: textColor }}>notifications</Icon>
                </Badge>
            </IconButton>

            <ThemeProvider theme={settings.themes[settings.activeTheme]}>
                <Drawer
                    width={'100px'}
                    container={container}
                    variant="temporary"
                    anchor={'right'}
                    open={panelOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                >
                    <Box sx={{ width: sideNavWidth }}>
                        <Notification>
                            <Icon color="primary">notifications</Icon>
                            <h5>Thông báo</h5>
                        </Notification>

                        {notifications?.map((notification) => (
                            <NotificationCard key={notification.id}>
                                <DeleteButton
                                    size="small"
                                    className="deleteButton"
                                    onClick={() =>
                                        deleteNotification(notification.id)
                                    }
                                >
                                    <Icon className="icon">clear</Icon>
                                </DeleteButton>
                                <Link
                                    to={`/${notification.path}`}
                                    onClick={handleDrawerToggle}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Card sx={{ mx: 2, mb: 3 }} elevation={3}>
                                        <CardLeftContent>
                                            <Box display="flex">
                                                <Icon
                                                    className="icon"
                                                    color={
                                                        notification.icon.color
                                                    }
                                                >
                                                    {notification.icon.name}
                                                </Icon>
                                                <Heading>
                                                    {notification.heading}
                                                </Heading>
                                            </Box>
                                            <Small className="messageTime">
                                                {console.log(notification.timestamp)}
                                                {getTimeDifference(
                                                    new Date(
                                                        notification.timestamp,
                                                    ),
                                                )}
                                                trước
                                            </Small>
                                        </CardLeftContent>
                                        <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                                            <Paragraph sx={{ m: 0 }}>
                                                {notification.title}
                                            </Paragraph>
                                            <Small sx={{ color: secondary }}>
                                                {notification.subtitle}
                                            </Small>
                                        </Box>
                                    </Card>
                                </Link>
                            </NotificationCard>
                        ))}
                        {!!notifications?.length && (
                            <Box sx={{ color: secondary }}>
                                <Button onClick={clearNotifications}>
                                    <Icon className="delete_forever">
                                        delete_forever
                                    </Icon>{' '}
                                    Xoá hết thông báo
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Drawer>
            </ThemeProvider>
        </Fragment>
    );
};

export default NotificationBar;
