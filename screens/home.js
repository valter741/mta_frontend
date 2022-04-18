import React, { useState, useEffect } from 'react';
import CheckBox from '@react-native-community/checkbox';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Pressable,
    Text,
    View,
  } from 'react-native';

import Task from '../components/task.js'
import '../components/global.js'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Dialog from 'react-native-dialog';

const Home = () => {

    const [isLoaded, setIsLoaded] = useState(false);
    const [reload, setReload] = useState(false);
    const [taskItems, setTaskItems] = useState({});
    const [visibleFilterDialog, setVisibleFilterDialog] = useState(false);
    const [visibleAddTaskDialog, setVisibleAddTaskDialog] = useState(false);
    
    const [taskUserId, setTaskUserId] = useState();
    const [taskTargetId, setTaskTargetId] = useState();
    const [taskName, setTaskName] = useState();
    const [taskObjective, setTaskObjective] = useState();
    //const [taskCompletion, setTaskCompletion] = useState();
    
    const showFilterDialog = () => {setVisibleFilterDialog(true);};
    const cancelFilterDialog = () => {setVisibleFilterDialog(false);};
    const applyFilter = () => {cancelFilterDialog(); getTasks("http://" + global.ip + "/bckend/tasks/view");}
    const showAddTaskDialog = () => {setVisibleAddTaskDialog(true);};
    const cancelAddTaskDialog = () => {setVisibleAddTaskDialog(false);};

    const [checkboxAllTasks, setCheckboxAllTasks] = useState(true);
    const [checkboxForMeTasks, setCheckboxForMeTasks] = useState(false);
    const [checkboxFromMeTasks, setCheckboxFromMeTasks] = useState(false);
    const [checkboxGreenTasks, setCheckboxGreenTasks] = useState(false);
    const [checkboxOrangeTasks, setCheckboxOrangeTasks] = useState(false);
    const [checkboxRedTasks, setCheckboxRedTasks] = useState(false);

    const onlyCheckboxAllTasks = (newValue) => {
      setCheckboxAllTasks(newValue);
      setCheckboxForMeTasks(false);
      setCheckboxFromMeTasks(false);
      setCheckboxGreenTasks(false);
      setCheckboxOrangeTasks(false);
      setCheckboxRedTasks(false);
    };

    const getTasks = async (url) => {
        if (!checkboxAllTasks) {
          url = url+"?";
          if (checkboxFromMeTasks) {
            url = url+"userid="+1;
          }
          if (checkboxForMeTasks) {
            if (checkboxFromMeTasks) url = url+"&";
            url = url+"targetid="+1;
          }
          if (checkboxRedTasks) {
            if (checkboxFromMeTasks || checkboxForMeTasks) url = url+"&";
            url = url+"completion=0";
          }
          if (checkboxOrangeTasks) {
            if (checkboxFromMeTasks || checkboxForMeTasks || checkboxRedTasks) url = url+"&";
            url = url+"completion=50";
          }
          if (checkboxGreenTasks) {
            if (checkboxFromMeTasks || checkboxForMeTasks || checkboxRedTasks || checkboxOrangeTasks) url = url+"&";
            url = url+"completion=100";
          }
        }
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
            //setTaskItems([...taskItems, data]);
            setTaskItems(data);
            setReload(false);
            setIsLoaded(true);
        })
    }
    
    const postTask = async () => {
        console.log(taskUserId, typeof taskTargetId, taskName, taskObjective);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "userid": 1,
                "targetid": parseInt(taskTargetId),
                "name": taskName,
                "objective": taskObjective,
                "completion": 0
            })
        };
        await fetch("http://" + global.ip + "/bckend/tasks/create", requestOptions)
        .then(function(response) {
          console.log(response.status)
          if (response.status == 400) {
            Alert.alert("400 BAD REQUEST\nVyplňte všetky polia.");
          } else if (response.status == 200) {
            cancelAddTaskDialog();
            setTaskTargetId(null);
            setTaskName(null);
            setTaskObjective(null);
            getTasks("http://" + global.ip + "/bckend/tasks/view");
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

    useEffect(() => {
        if(!isLoaded){
            getTasks("http://" + global.ip + "/bckend/tasks/view");
        }
      });

    return (
      <SafeAreaView style={styles.sectionContainer}>
        <Dialog.Container visible={visibleFilterDialog}>
          <Dialog.Title>Filtrovanie</Dialog.Title>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxAllTasks} onValueChange={(newValue) => onlyCheckboxAllTasks(newValue)}/>
            <Text style={{alignSelf: 'center'}}>Všetky úlohy</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxForMeTasks} onValueChange={(newValue) => {setCheckboxForMeTasks(newValue); setCheckboxAllTasks(false)}}/>
            <Text style={{alignSelf: 'center'}}>Úlohy pre mňa</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxFromMeTasks} onValueChange={(newValue) => {setCheckboxFromMeTasks(newValue); setCheckboxAllTasks(false)}}/>
            <Text style={{alignSelf: 'center'}}>Úlohy odo mňa</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxRedTasks} onValueChange={(newValue) => {setCheckboxRedTasks(newValue); setCheckboxAllTasks(false)}}/>
            <Text style={{alignSelf: 'center'}}>Nezačaté úlohy</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxOrangeTasks} onValueChange={(newValue) => {setCheckboxOrangeTasks(newValue); setCheckboxAllTasks(false)}}/>
            <Text style={{alignSelf: 'center'}}>Prebiehajúce úlohy</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={checkboxGreenTasks} onValueChange={(newValue) => {setCheckboxGreenTasks(newValue); setCheckboxAllTasks(false)}}/>
            <Text style={{alignSelf: 'center'}}>Dokončené úlohy</Text>
          </View>
          <Dialog.Button label="Zrušiť" onPress={cancelFilterDialog} />
          <Dialog.Button label="Filtrovať" onPress={applyFilter} />
        </Dialog.Container>
        <Dialog.Container visible={visibleAddTaskDialog}>
          <Dialog.Title>Pridať úlohu</Dialog.Title>
          <Dialog.Input placeholder={'Target User ID'} value={taskTargetId} onChangeText={text => setTaskTargetId(text)}></Dialog.Input>
          <Dialog.Input placeholder={'Task Name'} value={taskName} onChangeText={text => setTaskName(text)}></Dialog.Input>
          <Dialog.Input placeholder={'Task Objective'} value={taskObjective} onChangeText={text => setTaskObjective(text)}></Dialog.Input>
          <Dialog.Button label="Zrušiť" onPress={cancelAddTaskDialog} />
          <Dialog.Button label="Pridať" onPress={postTask} />        
        </Dialog.Container>
        
        <ScrollView>
          {
            isLoaded 
              ? taskItems.items.map((item, index) => {
                  return (
                    <View key={index}>
                      <Task 
                        id={item.id} 
                        userID={item.userid} 
                        userFullName={item.userFullName} 
                        targetID={item.targetid} 
                        targetFullName={item.targetFullName} 
                        name={item.name} 
                        objective={item.objective} 
                        completion={item.completion}
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
                  onPress={() => getTasks("http://" + global.ip + "/bckend/tasks/view")}
                >
                  <Text style={{fontSize: 18}}> Reload </Text>
                </Pressable> 
              : <Text></Text>
          }
        </ScrollView>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={styles.addTaskView}>
            <Pressable
              style={styles.addTaskButton} 
              android_ripple={{color:'darkgrey', borderless: true}} 
              onPress={showAddTaskDialog}
            >
              <Text style={styles.plusText}>+ Pridať úlohu</Text>
            </Pressable>
          </View>
          <View style={styles.filterView}>
            <Pressable
              style={styles.filterButton} 
              android_ripple={{color:'darkgrey', borderless: true}} 
              onPress={showFilterDialog}
            >
              <MaterialCommunityIcons name="filter" color={'grey'} size={30}/>
            </Pressable>
          </View>
        </View>
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

export default Home