/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions,
  Button,
  ToastAndroid,
  ImageBackground,
  TouchableOpacity,
  PanResponder,
  Image,
  FlatList,
  RefreshControl
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { RNCamera, FaceDetector } from 'react-native-camera';
const { width, height } = Dimensions.get('window');
import ImageEditor from "@react-native-community/image-editor";
import FastImage from 'react-native-fast-image'
import Galeria from './Galeria'
const uuidv4 = require('uuid/v4')
let camera = null

export default class App extends React.Component {
  state = {
    cameraType: RNCamera.Constants.Type.back.App,
    topModal: '100%',
    topModalG: '100%',
    uri: null,
    base64: null,
    data: [],
    uriCrop: null,
    cacheControl: FastImage.cacheControl.web,
    translateX: width/3,
    translateY: height/3,
    widthCrop: width/3,
    heightCrop: height/3, 
    scale: 1,
    oCrop: 0,
    isLoading: false
  }
  
  constructor(props) {
    super(props);
    this._translateX = 0
    this._translateY = 0
    this._pageY = 0
    this._scale = 1
    this._isResize = false
    this._lastScale = 0

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        const {widthCrop} = this.state
        const {heightCrop} = this.state
        this._translateX = evt.nativeEvent.locationX
        this._translateY = evt.nativeEvent.locationY
        this._pageY = evt.nativeEvent.pageY 
        this._isResize = false
        this._lastScale = 1    
        this._lastWidth = widthCrop
        this._lastHeight = heightCrop
        console.log(`lX: ${evt.nativeEvent.locationX}`)
        console.log(`lY: ${evt.nativeEvent.locationY}`)
        console.log(`fingers: ${gestureState.numberActiveTouches}`)
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        const nFingers = gestureState.numberActiveTouches
        if (nFingers === 1){ 
          if (this._isResize === false){
            const translateX = evt.nativeEvent.pageX - this._translateX 
            const translateY = evt.nativeEvent.pageY - this._translateY
            this.setState({ translateX: translateX })
            this.setState({ translateY: translateY })
          }else{
            let { widthCrop } = this.state
            let { heightCrop } = this.state
            this._lastWidth = widthCrop
            this._lastHeight = heightCrop
          }
        }else if(nFingers === 2){
           
         // let {scale} = this.state 
          let _scale = 0 
          if (this._pageY < evt.nativeEvent.touches[1].pageY){
            _scale = (this._pageY/(evt.nativeEvent.touches[0].pageY))
           // this._pageY = evt.nativeEvent.touches[0].pageY 
          }else{
            _scale = (this._pageY / (evt.nativeEvent.touches[1].pageY)) 
            this._pageY = evt.nativeEvent.pageY 
          }
          /// / height
           /// this._lastScale
          if (!this._isResize){ 
            this._lastScale = _scale
            this._isResize = true
          }
          console.log(`s: ${_scale}`)
          _scale /=  this._lastScale 
          //if(_scale>1){
          let {widthCrop} = this.state
          let {heightCrop} = this.state 
          widthCrop = ((this._lastWidth) * _scale)
          heightCrop = ((this._lastHeight) * _scale)        
          this.setState({ widthCrop: widthCrop}) 
          this.setState({ heightCrop: heightCrop})
          
          
          console.log(`pageY ${this._pageY} pageY[1]: ${evt.nativeEvent.touches[1].pageY}`)
         // this.setState({scale: 1+_scale})
        }
       // console.log(`fingersM: ${gestureState.numberActiveTouches}`)
        
        //console.log(`X2 ${evt.nativeEvent.pageX} Y2: ${evt.nativeEvent.pageY}`)
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }
  
  getData() {
      const data = [{
          key: uuidv4(),
          // key: '1',
          uri: 'http://35.239.230.74:3001/1.jpg'
        },
        {
          key: uuidv4(),
          //key: '2',
          uri: 'http://35.239.230.74:3001/2.jpg'
        },
        {
          key: uuidv4(),
          //key: '3',
          uri: 'http://35.239.230.74:3001/3.jpg'
        }
      ]
      this.setState({data: data})
  }

  showGalery = () =>{
      this.setState({isLoading: true})
      this.setState({ topModalG: 0 })
      this.getData()  
     // this.setState({ isLoading: false })
  }

  renderRefreshControl() {
    this.getData()
    this.setState({cacheControl: FastImage.cacheControl.web})
	}

  closeGalery = () => {
    this.setState({topModalG: '100%'})
    this.setState({ isLoading: false })
  }

  handlePicture = async () => {
    ToastAndroid.showWithGravity(
      'Capturando...',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    )
    if (camera) {
      
      const options = {
        quality: 1,
        base64: true,
        fixOrientation: true, 
        pauseAfterCapture: true,
      //  skipProcessing: true,
        width: width
      };
      await camera.takePictureAsync(options).then(
        r => {
          this.setState({uri: r.uri})
          this.setState({base64: r.base64})
          this.setState({topModal: 0})
           camera.getSupportedRatiosAsync().then(r=>{
            //  console.log(r)
          })

          
        }
      )

    }
  } 

  flip = () => {
    const {Type} = RNCamera.Constants
    const cameraType = this.state.cameraType === Type.back ? Type.front : Type.back  
    this.setState({cameraType: cameraType})
  }

  closePreview = () => {
    const {oCrop} = this.state
    if (oCrop === 0) {
     this.setState({topModal: '100%'})
     camera.resumePreview()
    }else{
      const {uriCrop} = this.state
      if(uriCrop===null){
        this.setState({oCrop: 0})
      }else{
        this.setState({uriCrop: null})
      }
    }
  }

  sendData = async () => {
    try {
      const sendUri = 'http://35.239.230.74:3000/'
      const { base64 } = this.state
      const bodyJSON = { 
        base64: base64, 
        id: '1'
      }
      ToastAndroid.showWithGravity(
        'Enviando...',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      )
      const response = await fetch(sendUri, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyJSON)
      })
      const responseJson = await response.json().then(r => {
        console.log(`Response1: ${r.error.name}`)

        ToastAndroid.showWithGravity(
          'Enviada correctamente...',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        ) 
      })

    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }
 
  crop = () => {
    const {oCrop} = this.state
    if(oCrop === 0){
      this.setState({oCrop: 1})
    }else{
      const { uri } = this.state
      const { translateX } = this.state
      const { translateY } = this.state
      const { widthCrop } = this.state
      const { heightCrop } = this.state
      const cropData = {
        offset: { x: translateX, y: translateY },
        size: { width: widthCrop, height: heightCrop },
        //  displaySize: {width: width, height: height},
        //resizeMode: 'contain' | 'cover' | 'stretch',
      } 
      ImageEditor.cropImage(uri, cropData).then(url => {
        this.setState({ uriCrop: url })
        ToastAndroid.showWithGravity(
          'Hecho', 
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        )
      })
    }
  }

  render(){
  const {cameraType} = this.state
  const {uri} = this.state
  const {uriCrop} = this.state
  const {data} = this.state
  const {cacheControl} = this.state
  const {translateX} = this.state
  const {translateY} = this.state
  const {widthCrop} = this.state
  const {heightCrop} = this.state
  const {scale} = this.state
  const {oCrop} = this.state
  styles.cgView = {
    flex: 1,
    display: 'flex',
    position: 'absolute',
    top: this.state.topModal,
    width: '100%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
          
          <View style={styles.body}>
            <View style={styles.container}>
              <RNCamera
                ref={ref => {
                  try{
                    camera = ref;
                  }catch(e){}
                }}
                style={styles.preview}
                type={cameraType}
                flashMode={RNCamera.Constants.FlashMode.auto}
                ratio = '16:9'
                //resizeMode = 'stretch'
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                  title: 'Permission to use audio recording',
                  message: 'We need your permission to use your audio',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                //onGoogleVisionBarcodesDetected={({ barcodes }) => {
                //  console.log(barcodes);
                //}}
              />

              <View style={[styles.containerB, {alignItems: 'center'}]} >
                <Button title='Capturar' onPress={this.handlePicture} />
              </View>
              
              <View style = {[styles.containerB, {alignItems: 'flex-end'}]} >   
                  <Button title='Voltear' onPress={this.flip}  />
              </View>

              <View style = {[styles.containerB, {alignItems: 'flex-start'}]}>   
                  <Button title='Galería' onPress={this.showGalery}  />
              </View>
              </View>
              <View
              style = {
                {
                  flex: 1,
                  display: 'flex',
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  top: this.state.topModal
                }
              } >
                <View
                    style={styles.container}>
                    
                  <ImageBackground  
                      style={styles.camera}
                      source = {{uri: uri}}
                      resizeMode = 'stretch'
                  > 
                    <View
                      style={
                        [
                          {
                            flex: 1,
                            display: 'flex',
                            position: 'absolute',
                            width: widthCrop,
                            height: heightCrop,
                            opacity: oCrop,
                            borderStyle: 'dotted',
                            borderWidth: 0.5,
                            borderColor: 'red',
                          },
                          {
                            transform: [
                              { scale: scale },
                              { translateX: translateX },
                              { translateY: translateY },
                            ]
                          }
                        ]
                      }
                      {...this._panResponder.panHandlers}

                    >
                      <Image

                        resizeMode="cover"
                        style={{
                          flex: 1,
                          display: 'flex',
                          left: 0,
                          width: null,
                          height: '100%',
                          alignItems: 'stretch'
                        }}
                        source={{ uri: uriCrop }}
                      />

                    </View>
                    <View style = {[styles.containerB, {alignItems: 'flex-start'}]}>   
                      <Button title='Enviar' onPress={this.sendData}  />
                    </View>
                    <View style = {[styles.containerB, {alignItems: 'center'}]}>   
                      <Button title='Cortar' onPress={this.crop}  />
                    </View>
                    <View style = {[styles.containerB, {alignItems: 'flex-end'}]}>   
                      < TouchableOpacity style = {
                          styles.bCancelar
                        }
                        title = 'Cerrar'
                        onPress = {
                          this.closePreview
                        }
                      > 
                        <Text style={{color: 'white'}} >CERRAR</Text>
                      </ TouchableOpacity>
                    </View> 
                    
                  </ImageBackground>
                </View>
              </View>
              
              <View
              style = {
                {
                  flex: 1,
                  display: 'flex',
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  top: this.state.topModalG
                }
              } >
                <View
                    style={[styles.container,{alignItems: 'center'}]}
                > 
                  <Text style={{color: 'white'}} > {`GALERÍA`} </Text>
                  < Galeria > {this.state.isLoading} </Galeria>
                  <View style = {[styles.containerB, {alignItems: 'flex-end'}]}>    
                      <TouchableOpacity style = {
                          styles.bCancelar
                        }
                        title = 'Cerrar' 
                        onPress = {
                          this.closeGalery
                        } 
                      >  
                        <Text style={{color: 'white'}} >CERRAR</Text>
                      </ TouchableOpacity>
                    </View>  
                </ View>
              </ View>        
          </View>
    </>
  );
};
}
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    flex: 1,
    display: 'flex',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  preview: {
    flex: 1,
    display: 'flex',
    left:0,
    justifyContent: 'flex-start',
    alignContent: 'stretch',
    height: height,
    width: width
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor: 'black',
    alignContent: 'stretch'
  },
  containerB: {
      flex: 1,
      display: 'flex',
      position: 'absolute',
      width: '100%',
      height: '100%',
     // alignItems: 'center',
      justifyContent: 'flex-end'
  },
  camera: {
    flex: 1,
    display: 'flex',
    height: height,
    width: width,
  },
  bCancelar: {
    backgroundColor: 'red',
    height: 35,
    padding: 7.5,
    borderRadius: 5
  }
});

