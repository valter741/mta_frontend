import React, {useContext, useState} from 'react';

import {
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Button,
  } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';

const app = firebase.app();
const db = app.firestore();

const configuration = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
};

const Webrtc = () => {

    useFocusEffect(() => {
        const backAction = () => {
            if (cachedLocalPC) {
                cachedLocalPC.removeStream(localStream);
                cachedLocalPC.close();
            }
            setLocalStream();
            setRemoteStream();
            setCachedLocalPC();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
                backAction
        );

        return () => backHandler.remove();
    });

    function onLeaveCall() {
        if (cachedLocalPC) {
          cachedLocalPC.removeStream(localStream);
          cachedLocalPC.close();
        }
        setLocalStream();
        setRemoteStream();
        setCachedLocalPC();
    }

    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [cachedLocalPC, setCachedLocalPC] = useState();
    const [roomId, setRoomId] = useState('');

    const [isMuted, setIsMuted] = useState(false);

    const startLocalStream = async () => {
        const isFront = true;
        const devices = await mediaDevices.enumerateDevices();
    
        const facing = isFront ? 'front' : 'environment';
        const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
        const facingMode = isFront ? 'user' : 'environment';
        const constraints = {
          audio: true,
          video: {
            mandatory: {
              minWidth: 500,
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode,
            optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
          },
        };
        const newStream = await mediaDevices.getUserMedia(constraints);
        setLocalStream(newStream);
    };

    const switchCamera = () => {
        localStream.getVideoTracks().forEach(track => track._switchCamera());
    };

    const toggleMute = () => {
        if (!remoteStream) {
          return;
        }
        localStream.getAudioTracks().forEach(track => {
          track.enabled = !track.enabled;
          setIsMuted(!track.enabled);
        });
    };

    const startCall = async id => {
        const localPC = new RTCPeerConnection(configuration);
        localPC.addStream(localStream);
    
        const roomRef = await db.collection('rooms').doc(id);
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        localPC.onicecandidate = e => {
          if (!e.candidate) {
            console.log('Got final candidate!');
            return;
          }
          callerCandidatesCollection.add(e.candidate.toJSON());
        };
    
        localPC.onaddstream = e => {
          if (e.stream && remoteStream !== e.stream) {
            console.log('RemotePC received the stream call', e.stream);
            setRemoteStream(e.stream);
          }
        };
    
        const offer = await localPC.createOffer();
        await localPC.setLocalDescription(offer);
    
        const roomWithOffer = { offer };
        await roomRef.set(roomWithOffer);
    
        roomRef.onSnapshot(async snapshot => {
          const data = snapshot.data();
          if (!localPC.currentRemoteDescription && data.answer) {
            const rtcSessionDescription = new RTCSessionDescription(data.answer);
            await localPC.setRemoteDescription(rtcSessionDescription);
          }
        });
    
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
              let data = change.doc.data();
              await localPC.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
    
        setCachedLocalPC(localPC);
    };

    const joinCall = async id => {
        const roomRef = await db.collection('rooms').doc(id);
        const roomSnapshot = await roomRef.get();
    
        if (!roomSnapshot.exists) return
        const localPC = new RTCPeerConnection(configuration);
        localPC.addStream(localStream);
    
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        localPC.onicecandidate = e => {
          if (!e.candidate) {
            console.log('Got final candidate!');
            return;
          }
          calleeCandidatesCollection.add(e.candidate.toJSON());
        };
    
        localPC.onaddstream = e => {
          if (e.stream && remoteStream !== e.stream) {
            console.log('RemotePC received the stream join', e.stream);
            setRemoteStream(e.stream);
          }
        };
    
        const offer = roomSnapshot.data().offer;
        await localPC.setRemoteDescription(new RTCSessionDescription(offer));
    
        const answer = await localPC.createAnswer();
        await localPC.setLocalDescription(answer);
    
        const roomWithAnswer = { answer };
        await roomRef.update(roomWithAnswer);
    
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
              let data = change.doc.data();
              await localPC.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
    
        setCachedLocalPC(localPC);
      };
    

    return(
        <>
            <TextInput style={styles.input} value={roomId} onChangeText={setRoomId} placeholder='Meno izby' placeholderTextColor="black" />
            <View style={styles.callButtons} >
                {!localStream && <Pressable onPress={startLocalStream} style={styles.inputButton} android_ripple={{color: 'grey'}}>
                        <Text style={{color: 'white'}}>Click to start stream</Text>
                </Pressable>}
                {localStream && <Pressable onPress={() => startCall(roomId)} style={styles.inputButton} android_ripple={{color: 'grey'}} disabled={!!remoteStream}>
                        <Text style={{color: 'white'}}>Click to start call</Text>
                </Pressable>}
                {localStream && <Pressable onPress={() => joinCall(roomId)} style={styles.inputButton} android_ripple={{color: 'grey'}} disabled={!!remoteStream}>
                        <Text style={{color: 'white'}}>Click to join call</Text>
                </Pressable>}
            </View>

            {localStream && (
                <View style={styles.toggleButtons}>
                    <Pressable onPress={switchCamera} style={styles.inputButton} android_ripple={{color: 'grey'}}>
                            <Text style={{color: 'white'}}>Switch camera</Text>
                    </Pressable>
                    <Pressable onPress={toggleMute} style={styles.inputButton} android_ripple={{color: 'grey'}} disabled={!remoteStream}>
                            <Text style={{color: 'white'}}>{`${isMuted ? 'Unmute' : 'Mute'} stream`}</Text>
                    </Pressable>
                </View>
            )}

            <View style={{ display: 'flex', flex: 1, padding: 10 }} >
                <View style={styles.rtcview}>
                {localStream && <RTCView style={styles.rtc} streamURL={localStream && localStream.toURL()} />}
                </View>
                <View style={styles.rtcview}>
                {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream && remoteStream.toURL()} />}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    inputButton: {
        height: 50,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
    },
    input: {
        color: 'black',
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
      },
    sectionContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,   
        paddingHorizontal: 24,
        flexDirection: 'row',
        backgroundColor: 'darkgrey',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        paddingVertical: 12,   
        marginTop: 8,
        fontSize: 24,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    heading: {
        alignSelf: 'center',
        fontSize: 30,
      },
      rtcview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        margin: 5,
      },
      rtc: {
        flex: 1,
        width: '100%',
        height: '100%',
      },
      toggleButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      callButtons: {
        padding: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      buttonContainer: {
        margin: 5,
      }
});

export default Webrtc