import React from 'react'
import { Button} from 'react-native'

export default props => {

const executar = () => {
    console.warn('Exec!!!')
}

    return (
        <>
        <Button 
        title="Executar #1"
        onPress={executar}
        />
        <Button 
        title="Executar #2"
        onPress={function (){
            console.warn('Exec #02!!!!')
            
        }
    }
        />
        <Button 
        title="Executar #2"
        onPress={() =>{
            console.warn('Exec #03!!!!')
            
        }
    }
        />
        </>
    )
}