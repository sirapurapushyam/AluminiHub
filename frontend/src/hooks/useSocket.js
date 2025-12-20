import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useSocket = () => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      console.log('Connecting socket with userId:', user._id);
      const newSocket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        query: {
          userId: user._id
        }
      });
      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return socket;
};

export default useSocket;