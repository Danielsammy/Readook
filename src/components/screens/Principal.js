import React, { useEffect, useState } from 'react'
import { Container } from '../../style'
import Header from '../Header/Header'
import {Tab} from '../Tabs/Tab'
import Global from './Global'
import { socket } from '../../services/socket'
import {useNavigation} from '@react-navigation/native'
import PushNotification from 'react-native-push-notification'





const Home = () => {
    PushNotification.configure({
        onNotification: function (notification) {
          goToChatMensagem(notification)
        },
        onAction: function (notification) {
          console.log("ACTION:", notification.action);
          console.log("NOTIFICATION:", notification);
        },        
        popInitialNotification: true,
        requestPermissions: true,
      })

      const goToChatMensagem = ({data}) => {
        navigation.navigate('ChatMensagem', {
            chatCodigo: data.chatCodigo,
            codigoDest: data.user._id,
            name: data.user.name,
            avatar: data.user.avatar})
    }

    const navigation = useNavigation()
    const [ notification , setNotification ] = useState([])
    const [ deliveredNotification, setDeliveredNotification ] = useState([])
    const [ lingp, setLingp] = useState(Global.lingp)

    
    useEffect(() => {
        const handleNotification = (data) => {
            setNotification(data)
            const url = `${data.userRem.avatar}`
            PushNotification.getDeliveredNotifications((notification) => {
                if (notification.length !== 0) {

                }
                else {

                }
            })
            PushNotification.localNotification({
                channelId: 'readook-channel',
                title: data.userRem.name,
                message: data.message,
                largeIconUrl: String(url),
                data: {
                    user : {
                        _id : data.userRem._id,
                        name: data.userRem.name,
                        avatar: data.userRem.avatar
                    },
                    chatCodigo : data.chatCodigo
                }
            })
        }
        socket.on('notifyChatMensagem', data => {
            if (data.userDest === Global.user.usrCodigo) {
                const index = navigation.dangerouslyGetState().index ;
                const screenName = navigation.dangerouslyGetState().routes[index].name
                if (screenName === "ChatMensagem") {
                    const codigoChatNotificacao = data.chatCodigo
                    const codigoChatAtual = navigation.dangerouslyGetState().routes[index].params.chatCodigo;
                    if (codigoChatAtual === codigoChatNotificacao) {
                        return ''
                    }
                    else {
                        handleNotification(data)
                    }
                }
                else {
                    handleNotification(data)
                }
                }
              })
              return () => {
                socket.off('notifyChatMensagem')}
            }, [notification])
    return (
        <Container>
            <Header lingp={lingp} onChangeLingp = {setLingp}/>        
            <Tab lingp={lingp}/>
        </Container>
        )
}

export default Home