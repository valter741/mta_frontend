import React, {useContext, useState} from 'react';

import {
    Alert,
    SafeAreaView,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from 'react-native';

import AppContext from '../components/AppContext';

import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';

const app = firebase.app();
const db = app.firestore();

const Webrtc = () => {

    return(
        <SafeAreaView style={styles.sectionContainer}>
            <Text>Webrtc</Text>
        </SafeAreaView>
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
});

export default Webrtc