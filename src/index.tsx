import {v4 as uuidV4} from 'uuid';
import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'

const TASK_CHECKED_EVENT = 'task-checked';
const confettiRootElement = document.querySelector<HTMLDivElement>('#confetti-root');

if (!confettiRootElement) {
  throw new Error('Missing #confetti-root element');
}

createRoot(confettiRootElement).render(<ConfettiOverlay />);

function ConfettiOverlay() {
  const { width, height } = useWindowSize()
  const [isVisible, setIsVisible] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const timeoutId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleTaskChecked = () => {
      setIsVisible(true);
      setBurstId((currentId) => currentId + 1);

      if (timeoutId.current !== undefined) {
        window.clearTimeout(timeoutId.current);
      }

      timeoutId.current = window.setTimeout(() => {
        setIsVisible(false);
        timeoutId.current = undefined;
      }, 3000);
    };

    window.addEventListener(TASK_CHECKED_EVENT, handleTaskChecked);
    return () => {
      window.removeEventListener(TASK_CHECKED_EVENT, handleTaskChecked);
      if (timeoutId.current !== undefined) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return isVisible
    ? <Confetti key={burstId} width={width} height={height} numberOfPieces={1000}/>
    : null;
}

type Task = {
  id: string,
  value: string,
  checked: boolean,
  createdAt: Date
}

// define HTML elements
// document.querySelector<>
const list = document.querySelector<HTMLUListElement>('#list');
const form = document.querySelector<HTMLFormElement>('#new-task-form');
const inputLabel = document.querySelector<HTMLInputElement>('#new-task-label');

// build list of tasks to be stored on local storage
const taskList : Task[] = loadTasks();
taskList.forEach(addListItem)


// event handler for "Add" submit button getting pressed
// creates the "newTask" Task-type object
// appends new object to local storage-saved tasks
// the ?s ensure that the object is there before trying to access its value
form?.addEventListener("submit", e=>{
  e.preventDefault()

  if (inputLabel?.value == "" || inputLabel?.value == null) return 

  // create new Task object
  const newTask : Task = {
    id: uuidV4(),
    value: inputLabel.value,
    checked: false,
    createdAt: new Date()
  }
  console.log(newTask);

  // add to task lists, local storage and HTML-rendered
  taskList.push(newTask)
  addListItem(newTask)
  
  // reset input form field to blank
  inputLabel.value = ""
})



// add the newTask item to the HTML rendered UL
function addListItem (task: Task){
  const listItem = document.createElement("li");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");

  // add the "checked"/change event listener to the checkbox
  checkbox.addEventListener("change", ()=>{
    // set completed to true
    task.checked = checkbox.checked
    // update the record in the locally stored task list
    updateLocalStorage();

    if (checkbox.checked) {
      window.dispatchEvent(new Event(TASK_CHECKED_EVENT));
    }
  })
  checkbox.type = "checkbox"
  checkbox.checked = task.checked
  label.append(checkbox, task.value)
  listItem.append(label)
  list?.append(listItem)


}

// set TASKS item in local storage to updated list of tasks
function updateLocalStorage(){
  localStorage.setItem("TASKS", JSON.stringify(taskList))
}

// load list of tasks in local storage
function loadTasks(): Task[]{
  const taskJSON = localStorage.getItem("TASKS")
  if (taskJSON == null) return []
  return JSON.parse(taskJSON)
}