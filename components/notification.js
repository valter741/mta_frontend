import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    Pressable,
    TouchableOpacity,
  } from 'react-native';


const Notification = (props) => {
  const [seen, setSeen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState();
  const [fromUser, setFromUser] = useState();
  const [toUser, setToUser] = useState();
  
  const updateSeen = () => {
    if (!seen) setSeen(true);
    else setSeen(false);
  };
  const updateNotificationIcon = () => {
    if (seen) return "email-open-outline";
    else return "email-alert-outline";
  };

  const deleteNotification = async () => {
    await fetch("http://" + global.ip + "/bckend/noti/delete/" + props.id, { method: 'DELETE' })
    .then(function(response) {
      console.log(response.status);
      if (response.status == 400) {
        Alert.alert("[deleteNotification]\n400 BAD REQUEST");
      } else if (response.status == 200) {
        //getTasks("http://" + global.ip + "/bckend/tasks/view");
      } else {
        throw Error(response.status);
      }
      return response;
    }).catch(error => {Alert.alert("Chyba servera. Skúste znovu."); console.log(error)})
  }

  return (
    <Pressable style={styles.item} onPress={updateSeen}>
        { !seen 
            ? <View style={props.completion == 0 ? styles.backgroundOpacity0 : 
                      props.completion == 50 ? styles.backgroundOpacity50 : styles.backgroundOpacity100}></View>
            : <View></View>
        }
        <View style={props.completion == 0 ? styles.completion0 : 
                      props.completion == 50 ? styles.completion50 : styles.completion100}></View>
        <View style={styles.notifInfo}>
          <View style={styles.notifHeader}>
            <MaterialCommunityIcons name={updateNotificationIcon()} color={'grey'} size={20}/>
            <Text style={styles.title}> {props.taskName}</Text>
            <Text style={styles.taskId}>#{props.taskID}</Text>
            <View style={styles.fromTo}>
              <Text style={{fontSize: 10}}>Od: {props.userFullName}</Text>
              <Text style={{fontSize: 10}}>Pre: {props.targetFullName}</Text>
            </View>
          </View> 
          <View style={styles.objective}>
              { seen 
                ? <Text>{props.content}</Text>
                : <Text></Text>
              }
          </View>
          <View style={styles.deleteView}>
            <Pressable
              style={styles.deleteButton}
              onPress={deleteNotification}
            >
              <Ionicons name="trash-outline" color={'darkgrey'} size={20}/>
            </Pressable>
          </View>
        </View>
    </Pressable>
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
      backgroundColor: '#FFF',
      //opacity: 0.25,
      //padding: 2,
      borderRadius: 10,
      flexDirection: 'row',
      //alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 15,
      elevation: 3,
    },
    notifInfo: {
      padding: 5,
      flexDirection: 'column',
      alignItems: 'flex-start',
      //justifyContent: 'space-between',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
    },
    taskId: {
      fontSize: 12, 
      alignSelf: 'flex-end', 
      position: 'relative', 
      bottom: 2,
    },
    notifHeader: {
      //width: 'auto',
      flexDirection: 'row',
      //flexWrap: 'wrap',
      alignItems: 'center',
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
    deleteView: {
      //backgroundColor: 'red',
      //position: 'relative',
      //left: 275,
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      width: '95%',
    },
    deleteButton: {

    },
    backgroundOpacity0: {
        position: 'absolute',
        alignSelf: 'stretch',
        width: '100%',
        height: '100%',
        backgroundColor: '#F00', 
        opacity: 0.25,
    },
    backgroundOpacity50: {
        position: 'absolute',
        alignSelf: 'stretch',
        width: '100%',
        height: '100%',
        backgroundColor: '#FA0', 
        opacity: 0.25,
    },
    backgroundOpacity100: {
        position: 'absolute',
        alignSelf: 'stretch',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F0', 
        opacity: 0.25,
    },
    completion0: {
      width: 25,
      height: '100%',
      backgroundColor: '#FF0000',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 0,
    },
    completion50: {
      width: 25,
      height: '100%',
      backgroundColor: '#FFAA00',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 0,
    },
    completion100: {
      width: 25,
      height: '100%',
      backgroundColor: '#00FF00',
      opacity: 0.5,
      borderRadius: 10,
      marginRight: 0,
    },
  });

export default Notification