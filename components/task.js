import React, { useState, useContext } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dialog from 'react-native-dialog';
import RadioGroup from 'react-native-radio-buttons-group';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    Pressable,
  } from 'react-native';
import AppContext from './AppContext';

const Task = (props) => {

  const radioButtonsData = [{
    id: '1',
    label: 'Nezačatá',
    color: '#FF0000',
    selected: props.completion == 0,
  }, {
    id: '2',
    label: 'Prebiehajúca', 
    color: '#FFAA00', 
    selected: props.completion == 50,
  }, {
    id: '3',
    label: 'Dokončená', 
    color: '#00FF00',
    selected: props.completion == 100,
  }];

  const myContext = useContext(AppContext);
  const [visibleEditTaskDialog, setVisibleEditTaskDialog] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [radioButtons, setRadioButtons] = useState(radioButtonsData);
  const [fromUser, setFromUser] = useState();
  const [toUser, setToUser] = useState();

  const showEditTaskDialog = () => {
    if (myContext.thisLogin == props.userID || myContext.thisLogin == props.targetID) setVisibleEditTaskDialog(true);
    else {
      Alert.alert("Nemáte oprávnenie upravovať túto úlohu.");
    }
  };
  const cancelEditTaskDialog = () => {setVisibleEditTaskDialog(false);};
  const onPressRadioButton = (radioButtonsArray) => {
    setRadioButtons(radioButtonsArray);
    console.log(radioButtons);
  };
  const getSelectedCompletion = () => {
    if (radioButtons[0].selected == true) return 0;
    else if (radioButtons[1].selected == true) return 50;
    else if (radioButtons[2].selected == true) return 100;
  };
  const updateTask = () => {
    if (notificationMessage == null && myContext.thisLogin == props.targetID) {
      Alert.alert("400 BAD REQUEST\nVyplňte správu notifikácie.");
    } else if (getSelectedCompletion() == props.completion) {
      Alert.alert("400 BAD REQUEST\nNezmenili ste stav úlohy.");
    } else {
      putTask();
      if (myContext.thisLogin == props.targetID) postNotification();
      props.getTask();
      cancelEditTaskDialog();
    }
  };
  const postNotification = async () => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "userid": props.targetID,
            "targetid": props.userID,
            "taskid": props.id,
            "content": notificationMessage,
            "token": myContext.thisToken,
        })
    };
    await fetch("http://" + global.ip + "/bckend/noti/create", requestOptions)
    .then(function(response) {
      //console.log(response.status)
      if (response.status == 400) {
        Alert.alert("[postNotification]\n400 BAD REQUEST");
      } else if (response.status == 200) {
        setNotificationMessage(null);
      } else {
        throw Error(response.status);
      }
      return response;
    }).catch(error => {Alert.alert("Chyba servera. Skúste znovu."); console.log(error)})
    .then(response => response.json())   
    .then(data => {
        console.log(data);
    })
  };
  const putTask = async () => {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          "completion": getSelectedCompletion(),  
          "token": myContext.thisToken,
        })
    };
    await fetch("http://" + global.ip + "/bckend/tasks/" + props.id + "/update", requestOptions)
    .then(function(response) {
      console.log(response.status);
      if (response.status == 400) {
        Alert.alert("[putTask]\n400 BAD REQUEST");
      } else if (response.status == 200) {
        //getTasks("http://" + global.ip + "/bckend/tasks/view");
      } else {
        throw Error(response.status);
      }
      return response;
    }).catch(error => {Alert.alert("Chyba servera. Skúste znovu."); console.log(error)})
    .then(response => response.json())   
    .then(data => {
        console.log(data);
    })
  }
  const deleteTask = async () => {
    if (myContext.thisLogin == props.userID) {
      await fetch("http://" + global.ip + "/bckend/tasks/delete/" + props.id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "token": myContext.thisToken,
        })
      })
      .then(function(response) {
        console.log(response.status);
        if (response.status == 400) {
          Alert.alert("[deleteTask]\n400 BAD REQUEST");
        } else if (response.status == 200) {
          props.getTask();
        } else {
          throw Error(response.status);
        }
        return response;
      }).catch(error => {Alert.alert("Chyba servera. Skúste znovu."); console.log(error)})
    }
    else {
      Alert.alert("Nemáte oprávnenie vymazať túto úlohu.");
    }
  }

  return (

    <View style={styles.item}>
      <Dialog.Container visible={visibleEditTaskDialog}>
          <Dialog.Title style={{ color: 'black'}}>Úprava úlohy</Dialog.Title>
          <Dialog.Description>
            <Text style={styles.title}>{props.name}</Text>
            <Text style={styles.taskId}>#{props.id}</Text>
          </Dialog.Description>
          <Dialog.Input style={{color: 'black'}} placeholder={'Notification Message'} placeholderTextColor='black' value={notificationMessage} onChangeText={text => setNotificationMessage(text)}></Dialog.Input>
          <RadioGroup containerStyle={styles.radioGroup} radioButtons={radioButtons} onPress={onPressRadioButton} />
          <Dialog.Button label="Zrušiť" onPress={cancelEditTaskDialog} />
          <Dialog.Button label="Uložiť" onPress={updateTask} />
      </Dialog.Container>
      <View style={props.completion == 0 ? styles.completion0 : 
                    props.completion == 50 ? styles.completion50 : styles.completion100}></View>
      <View style={styles.taskInfo}>
        <View style={styles.taskHeader}>
          <Text style={styles.title}>{props.name}</Text>
          <Text style={styles.taskId}>#{props.id}</Text>
          <View style={styles.fromTo}>
            <Text style={{fontSize: 10, color: 'black', 
                          fontWeight: myContext.thisLogin == props.userID ? 'bold' : 'normal',
                          }}>Od: {props.userFullName}</Text>
            <Text style={{fontSize: 10, color: 'black',
                          fontWeight: myContext.thisLogin == props.targetID ? 'bold' : 'normal',}}>Pre: {props.targetFullName}</Text>
          </View>
        </View> 
        <View style={styles.objective}><Text style={{ color: 'black'}}>{props.objective}</Text></View>
        <View style={styles.editView}>
          <Pressable
            style={styles.editButton}
            onPress={showEditTaskDialog}
          >
            <MaterialCommunityIcons name="square-edit-outline" color={'darkgrey'} size={20}/>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={deleteTask}
          >
            <Ionicons name="trash-outline" color={'darkgrey'} size={20}/>
          </Pressable>
        </View>
        {/*<Text>{props.completion}</Text>*/}
      </View>
    </View>
    )
}

const styles = StyleSheet.create({
    section1: {
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
    titles: {
      fontSize: 24,
      fontWeight: '600',
    },
    item: {
      backgroundColor: '#FFFFFF',
      //padding: 2,
      borderRadius: 10,
      flexDirection: 'row',
      //alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 15,
      elevation: 3,
    },
    taskInfo: {
      padding: 5,
      flexDirection: 'column',
      alignItems: 'flex-start',
      //justifyContent: 'space-between',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: 'black',
    },
    taskId: {
      fontSize: 12, 
      alignSelf: 'flex-end', 
      position: 'relative', 
      bottom: 2,
      color: 'black',
    },
    taskHeader: {
      //width: 'auto',
      flexDirection: 'row',
      //flexWrap: 'wrap',
      alignItems: 'stretch',
      //justifyContent: 'space-between',
      //backgroundColor: 'red',
      //paddingRight: 20,
    },
    fromTo: {
      //width: '100%',
      position: 'absolute',
      left: 175,
      //flexWrap: 'nowrap',
      //justifyContent: 'center',
      //paddingLeft: 30,
      alignItems: 'flex-start',
    },
    objective: {
      //backgroundColor: 'red',
      flexWrap: 'nowrap',
      width: 'auto',
      alignItems:'stretch',
    },
    editView: {
      //backgroundColor: 'red',
      position: 'relative',
      flex: 1,
      //top: 0,
      //left: 255,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 300,
    },
    editButton: {
      
    },
    deleteView: {
      //backgroundColor: 'red',
      position: 'relative',
      left: 275,
      //flexDirection: 'row',
      //alignItems: 'stretch',
      //justifyContent: 'flex-end',
      //width: '95%',
    },
    deleteButton: {

    },
    radioGroup: {
      alignItems: 'flex-start',
    },
    completion0: {
      width: 25,
      height: '100%',
      backgroundColor: '#FF0000',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 10,
    },
    completion50: {
      width: 25,
      height: '100%',
      backgroundColor: '#FFAA00',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 10,
    },
    completion100: {
      width: 25,
      height: '100%',
      backgroundColor: '#00FF00',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 10,
    },
  });

export default Task