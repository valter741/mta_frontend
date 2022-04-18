import React, {useContext, useState} from 'react';

import {
    Alert,
    SafeAreaView,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
    Image,
  } from 'react-native';

import AppContext from '../components/AppContext';
import '../components/global.js';
import DocumentPicker from 'react-native-document-picker'

const Profile = () => {

    const myContext = useContext(AppContext);
    const [login1, setLogin1] = useState("janci");
    const [password1, setPassword1] = useState("asd123");
    const [login2, setLogin2] = useState("Login");
    const [password2, setPassword2] = useState("Password");
    const [fullname, setFullname] = useState("Cele Meno");
    const [pageJson, setPageJson] = useState({});
    const [upImage, setUpImage] = useState("none");
    const [upName, setUpName] = useState("Meno")

    const doLogin = async () => {
        if(login1 == "Login" || password1 == "Password"){
            Alert.alert("Zadajte aj Login aj Password");
        }else{
            await fetch("http://" + global.ip + "/bckend/login/?login=" + login1 + "&password=" + password1)
            .then(function(response) {
                console.log(response.status)
                if (response.status == 404) {
                    Alert.alert("zle meno alebo heslo");
                }else if(response.status == 200){

                }else{
                    throw Error(response.status);
                }
                return response;
            }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setPageJson(data)
                myContext.setLogin(data.user.id)
                myContext.setToken(data.token)
            })
            
        }
    }

    const doRegister = async () => {
        if(login2 == "Login" || password2 == "Password" || fullname == "Cele Meno"){
            Alert.alert("Zadajte aj Login aj Password aj meno");
        }else{
            await fetch("http://" + global.ip + "/bckend/register/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "login": login2,
                    "password": password2,
                    "full_name": fullname
                })
            })
            .then(function(response) {
                console.log(response.status)
                if (response.status == 400) {
                    Alert.alert("zly request");
                }else if(response.status == 200){
                    Alert.alert("Registracia Uspesna, mozete sa prihlasit");
                }else if(response.status == 409){
                    Alert.alert("login uz existuje");
                }else{
                    throw Error(response.status);
                }
                return response;
            }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})            
        }
    }

    const updateProfile = async () => {
        if(upImage == "none" || upName == "Meno"){
            Alert.alert("Zadajte Meno a vberte aj obrazok");
        }else{
            const form = new FormData();
            form.append('image', upImage[0]);
            form.append('full_name', upName);
            console.log(form);
            await fetch("http://" + global.ip + "/bckend/profile/update/" + myContext.thisLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data; ',
                },
                body: form
            })
            .then(function(response) {
                console.log(response.status)
                if (response.status == 404) {
                    Alert.alert("zle meno alebo heslo");
                }else if(response.status == 200){
                    doLogin();
                }else{
                    throw Error(response.status);
                }
                return response;
            }).catch(error => {Alert.alert("chyba serverom skuste znovu"); console.log(error)})            
        }
    }

    const uploadImage = async () => {
        const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        setUpImage(res);
    }

    return(
        <SafeAreaView style={styles.sectionContainer}>
            {myContext.thisLogin == 0 ? 
                <ScrollView>
                    <TextInput
                        style={styles.input}
                        onChangeText={newText => setLogin1(newText)}
                        defaultValue={login1}
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={newText => setPassword1(newText)}
                        defaultValue={password1}
                    />
                    <Pressable style={styles.inputButton} android_ripple={{color:'grey'}} onPress={() => doLogin()}>
                        <Text>
                            Login
                        </Text>
                    </Pressable>
                    <View style={{height: 75}}></View>
                    <TextInput
                        style={styles.input}
                        onChangeText={newText => setLogin2(newText)}
                        defaultValue={login2}
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={newText => setPassword2(newText)}
                        defaultValue={password2}
                    />
                    <TextInput
                        style={styles.input}
                        onChangeText={newText => setFullname(newText)}
                        defaultValue={fullname}
                    />
                    <Pressable style={styles.inputButton} android_ripple={{color:'grey'}} onPress={() => doRegister()}>
                        <Text>
                            Register
                        </Text>
                    </Pressable>
                </ScrollView>
                : 
                <ScrollView >
                    <View style={{flex:1, alignItems: 'center', flexDirection: 'column'}}>
                        <Image
                            style={{height:150, width: 150}}
                            source={{
                            uri: 'http://' + global.ip + '/bckend' + pageJson.pic,
                            }}
                        />
                        <Text style={styles.sectionDescription}>ID: {pageJson.user.id}</Text>
                        <Text style={styles.sectionDescription}>Login: {pageJson.user.login}</Text>
                        <Text style={styles.sectionDescription}>Meno: {pageJson.user.full_name}</Text>                 
                    </View>
                    <View style={{marginTop: 50}}>
                        
                        <TextInput
                            style={styles.input}
                            onChangeText={newText => setUpName(newText)}
                            defaultValue={upName}
                        />
                        <Pressable style={styles.inputButton} android_ripple={{color:'grey'}} onPress={() => uploadImage()}>
                            {upImage == "none" ? <Text>Vyber Obrazok</Text> : <Text>Obrazok Vybraty</Text>}                           
                        </Pressable>
                        <Pressable style={styles.inputButton} android_ripple={{color:'grey'}} onPress={() => updateProfile()}>
                            <Text>
                                Update profilu
                            </Text>
                        </Pressable>
                        <Pressable style={styles.inputButton} android_ripple={{color:'grey'}} onPress={() => myContext.setLogin(0)}>
                            <Text>
                                Logout
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
                }
            
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

export default Profile