import React, { useState, useEffect, useCallback } from 'react'
import { View, BackHandler } from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { HeaderBackButton, HeaderTitle } from '@react-navigation/stack'
import { GiftedChat, Send, InputToolbar } from 'react-native-gifted-chat'
import Global from '../Global'
import { socket } from '../../../services/socket'
import { AvatarImage } from './styles'
import ImagemPerfilModal from '../../ImagemPerfilModal/ImagemPerfilModal'
import { TouchableNativeFeedback } from 'react-native'
import { Provider } from 'react-native-paper'

const ChatMensagem = ({navigation, route}) => {
  const chamaModal = (userAvatar) => {
    setShowAvatar(userAvatar)
    setVisible(!visible)
  }
  const [ visible, setVisible] = useState(false)
  const [ showAvatar, setShowAvatar] = useState('')
  const codigoChat = route.params.chatCodigo
  const nomeUsuario = route.params.name
  const userDest = route.params.codigoDest
  const userAvatar = route.params.avatar
  const [ onLoad,setOnLoad ] = useState(true)
  const navegacao = useNavigation();

  const atualizaMensagemNaoLidas = async () => {
    const informacaoUpdate = {}
    informacaoUpdate.chatCodigo = codigoChat
    informacaoUpdate.userDest = Global.user.usrCodigo
    const response = await fetch(`http://${Global.ipBancoDados}:${Global.portaBancoDados}/chatmensagem/update/lida`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(informacaoUpdate)
      })
      .then(response => response.json())
    return response
  }

  const puxaUltimasMensagens = async () => {
    await fetch(`http://${Global.ipBancoDados}:${Global.portaBancoDados}/chatMensagens/${codigoChat}`)
    .then(response => response.json())
    .then(results => transformMessages(results))
  }

  function transformMessages(results) {
    results.forEach((result) => {criaMensagem(result)})
  }

  function criaMensagem(mensagem){
    const newMessage = {};
    newMessage._id = mensagem.chm_codigo
    newMessage.text = mensagem.chm_mensagem
    newMessage.createdAt = mensagem.chm_datahora
    const user = {}
    user._id = mensagem.chm_usrcodigorem
    user.avatar= mensagem.usr_avatar
    user.name= mensagem.usr_nomecompleto
    newMessage.user = user
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessage))
  }

  const user1 = {
    _id: Global.user.usrCodigo,
    name: Global.user.usrNomeCompleto,
    avatar: Global.user.usrAvatar
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: nomeUsuario === '' ? 'No title' : `${nomeUsuario}`,
      headerLeft:() => (<View style={{display: 'flex', flexDirection: 'row'}}><HeaderBackButton
        onPress={() => backAction()}
        title="Info"
        tintColor="#fff"
      />
        <TouchableNativeFeedback style={{width: '50px', height:'50px'}} onPress={() => chamaModal(userAvatar)}>
          <AvatarImage source={{uri: userAvatar}}/>
        </TouchableNativeFeedback>
      </View>
      ),
      headerTitle: (props) => (<HeaderTitle style={{marginLeft:40,color:'white', fontSize:16}}>{props.children}</HeaderTitle>),
      
    });
  }, [navigation, nomeUsuario]);

  const [ messages, setMessages ] = useState([]);

  useEffect(() => {
    if (onLoad) {
      atualizaMensagemNaoLidas();
      puxaUltimasMensagens();
      setOnLoad(false)
    }   
  },[onLoad])

  useEffect(() => {
    const handleNewMessage = novaMensagem => {
      setMessages(previousMessages => GiftedChat.append(previousMessages, novaMensagem))
    }
    socket.on('chatMensagem', data => {
      if (data.userDest == Global.user.usrCodigo) {
        const codigoChatRecebido = data.message[0].chatCodigo
        const codigoChatAtual = codigoChat
        if (codigoChatAtual !== codigoChatRecebido) {
            return ''
        }
        handleNewMessage(data.message)
      }
    })
    return () => {
      socket.off('chatMensagem')}
  },[messages])

  
    const backAction = () => {
      const actualIndex = navegacao.dangerouslyGetState().index 
      const newIndex = actualIndex - 1
       navigation.dispatch(
          CommonActions.reset({
          index: newIndex,
          routes:[
            {name: 'Principal'},
            {name: 'Chat'},
          ], 
        })
        )
      return true;
    };

    useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const mandaMensagemBD = async (newMessages) => {
    const informacaoInsert = newMessages
    informacaoInsert[0].chatCodigo = codigoChat
    informacaoInsert[0].usrDest = userDest
    const response = await fetch(`http://${Global.ipBancoDados}:${Global.portaBancoDados}/chatMensagens/novaMensagem`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(informacaoInsert)
            })
            .then(response => response.json())
  }

  const onSend =   useCallback( async (newMessages = []) => {
    await setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages))
    const data = {
      userDest : userDest,
      message : newMessages,
    }
    await mandaMensagemBD(newMessages)
    await socket.emit('chatMensagem', data)
  }, )

  const renderSend = (props) => {
    return (
      <Send {...props} textStyle={{ color: '#002244' }} label={Global.lingp ? 'Enviar' : 'Send'} />
    )
  }
  const renderInputToolbar = (props) => {
    return (
      <InputToolbar {...props} placeholder={Global.lingp ? "Insira sua Mensagem" : "Type a Message"}/>
    )
  }

  return (
    <Provider>
      <View style={{width:"100%", height:'100%'}}>
      <GiftedChat user={user1}
      listViewProps={{
        style: {
          backgroundColor: '#daebeb',
        },
      }}
      textInputStyle={{
        color: '#000',
      }}
      renderSend={renderSend}
      messages={(messages)} 
      onSend={onSend}
      timeFormat={"HH:mm"}
      renderAvatar={null}
      renderInputToolbar={renderInputToolbar}
      />
      </View>   
      <ImagemPerfilModal imageUri={showAvatar} visible={visible} onChangeVisible={setVisible}/>
    </Provider>
  )
}

export default ChatMensagem;