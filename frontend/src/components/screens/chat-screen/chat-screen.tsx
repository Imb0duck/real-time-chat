import { useEffect, type JSX } from "react";
import { useIsUserLoading, useUser } from "../../../store/use-user-store";
import Spinner from "../../spinner/spinner";

function ChatScreen(): JSX.Element{
    const user = useUser(); 
    useEffect(() => {
        console.log(user);
    }, [user]);

    if (useIsUserLoading())
        return (
            <Spinner/>
        );

    return (
        <main className="chat__screen">
            
        </main>
    );
};

export default ChatScreen;