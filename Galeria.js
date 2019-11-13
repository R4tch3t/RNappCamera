import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    RefreshControl,
    Dimensions,
    ToastAndroid
} from 'react-native';
import FastImage from 'react-native-fast-image'
const { width, height } = Dimensions.get('window');
const uuidv4 = require('uuid/v4')

export default class Galeria extends React.Component {
state={
        data: [],
        cacheControl: FastImage.cacheControl.web,
        isLoading: false,
        isRender: false 
}

 reLoad = () => {
    
    if(this.state.data.length===0){
        this.getData()
    }
    
}

async getData() {
  //  this.setState({isLoading: true})
  
    let data = []
    const sendUri = 'http://35.239.230.74:3002/'
    const bodyJSON = {
        id: '1'
    }

    try {
        const response = await fetch(sendUri, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyJSON)
        })

        const responseJson = await response.json().then(r => {
            console.log(`Response1: ${r}`)
            for(const i in r){
                const id = r[i].id
                data.push({
                    key: uuidv4(),
                    uri: `http://35.239.230.74:3001/${id}.jpg`
                })
            }
            this.setState({
                isLoading: false
            })
        })
    }catch(e){
          
        if (e.message === 'Network request failed'){
            setTimeout(this.reLoad, 1500);
        }
    }

    this.setState({
        data: data
    })
}

renderRefreshControl() {
    this.getData()
    this.setState({
        cacheControl: FastImage.cacheControl.web
    })
}

componentDidMount(){
//setTimeout(this.reLoad, 900);
this.getData()
}
 

render() {
    const {data} = this.state
    const {cacheControl} = this.state
    
    return(
        
        <View   >
            <FlatList 
                
            data={
                data
            }
            extraData ={
                data
            }

            renderItem = {({item, index, separators}) => (
                <View style={styles.container}> 
                    <Text style={{color: 'white'}} > {`${item.key}.jpg:`} </Text>
                    <FastImage style = {
                    styles.camera
                    }
                
                    source = {
                        {
                            uri: item.uri, 
                        //    headers: { Authorization: 'someAuthToken' },
                            cache: cacheControl
                        }
                    }

                    />
                </View>
            )}
            //keyExtractor={(item, index) => item.id}
            onRefresh={() => this.renderRefreshControl()}
            refreshing={this.state.isLoading}
            initialNumToRender={9}
            />  
        </View>  
    )
}

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: 'black',
        alignContent: 'stretch',
        top: 0
    },
    camera: {
        flex: 1,
        display: 'flex',
        height: height,
        width: width,
    }

});
