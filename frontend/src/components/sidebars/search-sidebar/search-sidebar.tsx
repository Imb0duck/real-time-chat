import { useState, type JSX } from "react";
import { useUser } from "../../../store/use-user-store";
import { useUserChannels, useIsChannelsLoading, createChannel } from "../../../store/use-channels-store";
import { useUserResults, useChannelResults, search, clear, useIsSearchLoading } from "../../../store/use-search-store";
import { signOut } from "../../../store/use-user-store";
import ChannelCard from "../../cards/channel-card/channel-card";
import UserCard from "../../cards/user-card/user-card";
import CreateChannelModal from "../../create-channel-modal/create-channel-modal";
import { Search, X, PlusCircle, LogOut } from "lucide-react";
import { loadChannel } from "../../../store/use-active-channel-store";
import "./search-sidebar.css";

function SearchSidebar(): JSX.Element {
    const user = useUser();
    const channels = useUserChannels();
    const isChannelsLoading = useIsChannelsLoading();
    const isSearchLoading = useIsSearchLoading();
    const userResults = useUserResults();
    const channelResults = useChannelResults();

    const { id: userId } = user!;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim().length > 0) {
            search(value);
        } else {
            clear();
        }
    };

    const handleClearSearch = () => {
        setQuery('');
        clear();
    };

    return (
        <section className="search-sidebar sidebar">
            <div className="search-sidebar__buttons">
                <button className="search-sidebar__button action-button" onClick={() => setIsModalOpen(true)}><PlusCircle size={20} /></button>
                <button className="search-sidebar__button action-button" onClick={signOut}><LogOut size={20}/></button>
            </div>
            <div className="search-sidebar__search">
                <Search size={20}/>
                <input className="search-sidebar__search__input" type="text" value={query} onChange={handleSearchChange} placeholder="Search"/>
                {query && (<button className="search-sidebar__search__button close-button" onClick={handleClearSearch}><X size={18}/></button>)}
            </div>

            <div className="search-sidebar__lists">
                {query ? ( !isSearchLoading ?
                        <div className="search-sidebar__lists">
                            <h3 className="search-sidebar__lists__users-title">Users</h3>
                            {userResults.length === 0 && <p className="search-sidebar__lists__no-users-found">No users found</p>}
                            {userResults.map((u) => (<UserCard key={u.id} userInfo={u} onSelect={() => console.log("TODO: open sidebar")} />))}

                            <h3 className="search-sidebar__lists__channels-title">Channels</h3>
                            {channelResults.length === 0 && <p className="search-sidebar__lists__no-channels-found">No channels found</p>}
                            {channelResults.map((ch) => (<ChannelCard key={ch.id} channel={ch} onSelect={() => loadChannel(ch.id, userId)}/>))}
                        </div>
                        : <p className="loading">Loading...</p>
                ) : (
                    <ul className="channel-list list">
                        {isChannelsLoading ? <p className="loading">Loading...</p> :
                            channels.map((ch) => (<ChannelCard key={ch.id} channel={ch} onSelect={() => loadChannel(ch.id, userId)}/>))
                        }
                    </ul>
                )}
            </div>

            {isModalOpen && (
                <CreateChannelModal
                    onClose={() => setIsModalOpen(false)}
                    onCreate={(name) => {
                        if (user) createChannel(name, user.id);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </section>
    );
}

export default SearchSidebar;
