import ChatScreen from '../screens/chat-screen/chat-screen';
import LoginScreen from '../screens/login-screen/login-screen';
import { useUser } from '../../store/use-user-store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const user = useUser();
  
  return (
    <>
      {user ? <ChatScreen/> : <LoginScreen/>}
      <ToastContainer/>
    </>
  )
}

export default App;
