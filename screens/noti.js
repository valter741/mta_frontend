import React, { useState, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Pressable,
    Text,
    View,
  } from 'react-native';

import Notification from '../components/notification.js'
import '../components/global.js'


const Noti = () => {

    const [isLoaded, setIsLoaded] = useState(false);
    const [reload, setReload] = useState(false);
    const [notifications, setNotifications] = useState({});
    
    const [taskUserId, setTaskUserId] = useState();
    const [taskTargetId, setTaskTargetId] = useState();
    const [taskName, setTaskName] = useState();
    const [taskObjective, setTaskObjective] = useState();
    //const [taskCompletion, setTaskCompletion] = useState();
    
    const getNotifications = async (url) => {
        await fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).catch(error => {setReload(true); console.log(error)})
        .then(response => response.json())   
        .then(data => {
            console.log(data);
            setNotifications(data);
            setReload(false);
            setIsLoaded(true);
        })
    }

    useEffect(() => {
        if(!isLoaded){
            getNotifications("http://" + global.ip + "/bckend/noti/view");
        }
      });

    return (
      <SafeAreaView style={styles.sectionContainer}>
        <ScrollView>
          {
            isLoaded 
              ? notifications.items.map((item, index) => {
                  return (
                    <View key={index}>
                      <Notification 
                        id={item.id} 
                        userID={item.userid} 
                        userFullName={item.userFullName} 
                        targetID={item.targetid} 
                        targetFullName={item.targetFullName} 
                        taskID={item.taskid}  
                        taskName={item.taskName} 
                        content={item.content} 
                        completion={item.taskCompletion} 
                        seen={item.was_seen} 
                      />
                    </View>
                  )
                }) 
              : <Text>Loading...</Text>
          }
          { 
            reload 
              ? <Pressable 
                  style={styles.inputButton} 
                  android_ripple={{color:'grey'}} 
                  onPress={() => getNotifications("http://" + global.ip + "/bckend/noti/view")}
                >
                  <Text style={{fontSize: 18}}> Reload </Text>
                </Pressable> 
              : <Text></Text>
          }
        </ScrollView>
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
        backgroundColor: '#b2b2b2'
      },
    sectionContainer: {
        flex: 1,
        paddingVertical: 24,   
        paddingHorizontal: 24,
        backgroundColor: 'darkgrey',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    filterView: {
      overflow: 'hidden',
      borderRadius: 60,
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 10,
      elevation: 10,
    },
    filterButton: {
      width: 60,
      height: 60,
      backgroundColor: '#f6f6f6',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 60,
      borderColor: '#C0C0C0',
      borderWidth: 1,
      padding: 10,
    },
    addTaskView: {
        overflow: 'hidden',
        borderRadius: 60,
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 10,
        elevation: 10,
    },
    addTaskButton: {
        width: 240,
        height: 60,
        backgroundColor: '#f6f6f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 60,
        borderColor: '#C0C0C0',
        borderWidth: 1,
        padding: 10,
    },
    plusText: {
        fontSize: 20,
    },
});

export default Noti