import React, {useContext, useState, useEffect} from 'react';

import {
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
    Pressable,
  } from 'react-native';

import AppContext from '../components/AppContext';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Contacts = () => {

    const myContext = useContext(AppContext);

    const [isLoaded, setIsLoaded] = useState(false);
    const [loadStarted, setLoadStarted] = useState(false);
    const [pageJson, setPageJson] = useState({});
    const [messageOpen, setMessageOpen] = useState(0);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState("New Message");
    const [newContact, setNewContact] = useState("ID Noveho kontaktu");

    const isFocused = useIsFocused();

    const loadContacts = async () => {
        await fetch("http://" + global.ip + "/bckend/contacts/view?userid=" + myContext.thisLogin + "&token=" + myContext.thisToken)
        .then(function(response) {
            console.log(response.status)
            if(response.status == 200){

            }else if(response.status == 404){
                
            }else{
                throw Error(response.status);
            }
            return response;
        }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setPageJson(data);
            setIsLoaded(true);
            setLoadStarted(false);
        })
    }

    const contactPressed = async (id) => {
        await fetch("http://" + global.ip + "/bckend/msg/view?senderid=" + myContext.thisLogin +"&targetid=" + id + "&token=" + myContext.thisToken)
        .then(function(response) {
            console.log(response.status)
            if(response.status == 200){

            }else{
                throw Error(response.status);
            }
            return response;
        }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setMessages(data);
            setMessageOpen(id);
        })

    }

    const addContact = async () => {
        if(newContact == "ID Noveho kontaktu"){
            Alert.alert("Zadajte id kontaktu");
        }else if(isNaN(newContact)){
            Alert.alert("Zadajte iba numericke id");
        }else{
            await fetch("http://" + global.ip + "/bckend/contacts/add", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "userid": myContext.thisLogin,
                    "contactid" : parseInt(newContact),
                    "token": myContext.thisToken
                })
            })
            .then(function(response) {
                console.log(response.status)
                if (response.status == 400) {
                    Alert.alert("zly request");
                }else if(response.status == 200){
                    setIsLoaded(false);
                    setLoadStarted(true);
                    loadContacts();
                }else{
                    throw Error(response.status);
                }
                return response;
            }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})            
        }
    }

    const sendMessage = async () => {
        await fetch("http://" + global.ip + "/bckend/msg/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "senderid": myContext.thisLogin,
                "targetid": messageOpen,
                "content": newMessage,
                "token": myContext.thisToken
            })
        })
        .then(function(response) {
            console.log(response.status)
            if (response.status == 400) {
                Alert.alert("zly request");
            }else if(response.status == 200){
                contactPressed(messageOpen);
            }else{
                throw Error(response.status);
            }
            return response;
        }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})
    }

    const deleteMessage = async (id) => {
        await fetch("http://" + global.ip + "/bckend/msg/delete/" + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "token": myContext.thisToken,
            })
        })
        .then(function(response) {
            console.log(response.status)
            if (response.status == 400) {
                Alert.alert("zly request");
            }else if(response.status == 200){
                contactPressed(messageOpen);
            }else{
                throw Error(response.status);
            }
            return response;
        }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})
    }

    useEffect(() => {
        if(!isFocused && isLoaded){
            setIsLoaded(false);
            setMessageOpen(0);
        }
    }, [isFocused]);
    
    useFocusEffect(() => {
        const backAction = () => {
            setMessageOpen(0);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
                backAction
        );

        if(!isLoaded && myContext.thisLogin != 0 && !loadStarted){
            setLoadStarted(true);
            loadContacts();
        }
        console.log("effect");

        return () => backHandler.remove();
    });

    return(
        <SafeAreaView style={styles.sectionContainer}>
        {myContext.thisLogin == 0 ?
            <ScrollView>
                <Text>Login Please</Text>
            </ScrollView> :
            <View style={{flex:1}}>
                {isLoaded ?
                    <View style={{flex:1}}>
                        {messageOpen == 0 ?
                            <View style={{flex: 1}}>
                                <ScrollView style={{flex:1}}>
                                    {pageJson.items.map((item) => 
                                        <Pressable style={styles.section1} android_ripple={{color:'grey'}} onPress={() => contactPressed(item.contactid)}>
                                            <Text style={styles.titles}>ID: {item.contactid}</Text>
                                            <Text style={styles.titles}>Meno: {item.contactname}</Text>
                                        </Pressable>
                                    )}
                                </ScrollView>
                                <View style={{flex:0.1, flexDirection: 'row'}}>
                                    <TextInput
                                        style={[styles.input, {flex:1}]}
                                        onChangeText={newText => setNewContact(newText)}
                                        defaultValue={newContact}
                                        keyboardType='numeric'
                                    />
                                    <Pressable style={styles.section3} android_ripple={{color:'grey'}} onPress={() => addContact()}>
                                        <Text>Pridaj</Text>
                                    </Pressable>
                                </View> 
                            </View>:
                            <View style={{flex:1}}>
                                <ScrollView style={{flex:1}}>
                                    {messages.items.map((item) => 
                                        <View>
                                            {item.senderid == myContext.thisLogin ?
                                                <View style={{flex:1, flexDirection: 'row'}}>
                                                    <View style={styles.section2}>
                                                        <Text style={{flex:1}}>Vy: {item.content}</Text>
                                                    </View>
                                                    <Pressable style={[styles.section1, {flex:0.05}]}  android_ripple={{color:'grey'}} onPress={() => deleteMessage(item.id)}>
                                                        <MaterialCommunityIcons  name="trash-can" color={'white'} size={18}/>
                                                    </Pressable>
                                                </View>:
                                                <View style={styles.section1}>
                                                    <Text>{item.content}</Text>
                                                </View>
                                            }
                                        </View>
                                    )}
                                </ScrollView>
                                <View style={{flex:0.1, flexDirection: 'row'}}>
                                    <TextInput
                                        style={[styles.input, {flex:1}]}
                                        onChangeText={newText => setNewMessage(newText)}
                                        defaultValue={newMessage}
                                    />
                                    <Pressable style={styles.section3} android_ripple={{color:'grey'}} onPress={() => sendMessage()}>
                                        <Text>Poslat</Text>
                                    </Pressable>
                                </View>
                            </View>                      
                        }
                    </View> :
                    <Text>Loading..</Text>
                }
            </View>
        } 
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        flex: 1,
        paddingVertical: 24,   
        paddingHorizontal: 24,
        backgroundColor: 'darkgrey',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    section1:{
        backgroundColor: '#262626',
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 2,
        marginBottom: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    section2:{
        backgroundColor: '#6b3000',
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 2,
        marginBottom: 2,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    section3:{
        backgroundColor: '#262626',
        flex: 0.2,
        flexDirection: 'column',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 4,
        marginTop: 2,
        marginBottom: 2,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    titles: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Contacts