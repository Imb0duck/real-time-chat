import { useEffect, type JSX } from "react";
import { useIsUserLoading, useUser } from "../../../store/use-user-store";
import Spinner from "../../spinner/spinner";
import { loadChannels, stopUpdate, updateChannels } from "../../../store/use-channels-store";
import SearchSidebar from "../../sidebars/search-sidebar/search-sidebar";
import "./chat-screen.css";

function ChatScreen(): JSX.Element{
    const user = useUser();
    const isLoading = useIsUserLoading();

    useEffect(() => {
        if (!user) return;
        loadChannels(user.id);
        updateChannels(user.id);
        return () => stopUpdate();
    }, [user]);

    if (isLoading)
        return (
            <Spinner/>
        );

    return (
        <main className="chat-screen">
            <SearchSidebar />
            
        </main>
    );
};

export default ChatScreen;
