import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from '@expo/vector-icons'; 
import Snow from "react-native-snow-bg";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true); //work, wish 화면 변경 state
  const [text, setText] = useState(""); //input 상자 초기화
  const wish = () => setWorking(false);
  const work = () => setWorking(true);
  const [toDos, setToDos] = useState({});
  const onChangeText = (payload) => setText(payload); //text가 바뀌는 것을 state에 저장
  useEffect(() => {
    loadToDos();
  }, []);
  const deleteTodo = async (key) => { //삭제 버튼 클릭 시 발동
    Alert.alert("정말로 삭제하시겠습니까?", "확실해요?", [
      { text: "취소" },
      {
        text: "응, 확실해",
        onPress: async() => {
          const newTodos = { ...toDos }; //state의 내용을 새 obj생성
          delete newTodos[key]; //안에 있는 key를 제거
          setToDos(newTodos); //state를 업데이트
          await saveToDos(newTodos); //Async저장소 업데이트
        },
      },
    ]);
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); //obj를 string으로 변환 후 저장
    } catch (error) {
      alert(error);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s === null) {
        //null인 경우 리턴
        return;
      } else {
        setToDos(JSON.parse(s)); //string을 obj변환 후 state에 저장
      }
    } catch (error) {
      alert(error);
    }
  };
  const addToDo = async () => { //submit event에 반응해 발동
    if (text === "") {
      return;
    }
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    const newToDos = { ...toDos, [Date.now()]: { text, working } };// 새 스테이트에 다른 스테이트 정보를 넣고 새 데이터도 넣음
    setToDos(newToDos); //state update
    await saveToDos(newToDos); //Async 저장소에 update
    setText(""); //지우는 역할
    //state는 직접 수정하면 안되기 때문에 newstate를 생성한 후 합쳐야 함
    //방법 : Object.assign({}, 이전데이터, 새데이터)
  };
  return (
    <View style={{ ...styles.container, backgroundColor: working ? theme.bg : theme.brightBg }}>
      <StatusBar style="auto" />
      {working ? <Snow snowflakesCount={0} /> : <Snow snowflakesCount={150} fallspeed="fast"/>}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.brightBg }}
          >
            To do
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={wish}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            To wish
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        returnKeyType="done"
        style={styles.input}
        placeholder={working ? "해야 하는 것을 적으세요" : "하고 싶은 것을 적으세요"}
        onChangeText={onChangeText}
        value={text}
      />
      {/* object.keys(obj)로 키Array를 얻고
      .map(key => obj[key])으로 각 키를 map해서 그 key로 obj에서 내용을 찾을 수 있다. */}
      {/* 리스트의 working이 현재 working과 같지 않으면 표시가 되지 않는다. */}
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View  style={{ ...styles.toDo, backgroundColor: working ? theme.todoBg : theme.brightTodoBg }} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteTodo(key)}>
                <Fontisto name="trash" size={18} color={working ? theme.grey : theme.brighttrash} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 20,
    fontSize: 18,
    borderRadius: 15,
  },
  toDo: {
    backgroundColor: theme.todoBg,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
