import { useEffect, type JSX } from "react";
import { clearUsers, setUsers, useIsLoginLoading, useUserList } from "../../../store/use-login-store";
import Spinner from "../../spinner/spinner";
import UserCard from "../../cards/user-card/user-card";
import { signIn } from "../../../store/use-user-store";
import { toast } from "react-toastify";
import './login-screen.css';

function LoginScreen(): JSX.Element{
    const userList = useUserList();
    const isLoading = useIsLoginLoading();
    useEffect(() => {
        setUsers()
            .catch((error) => {
				if (error instanceof Error) {
					toast.error(error.message);
				}});
        return clearUsers;
    }, []);

    if (isLoading) return <Spinner/>;

    return (
        <main className="login-screen">
            <h1 className="login-screen__title">Choose your character</h1>
            <ul className="user-list list">
                {userList.map((u) => (
                    <UserCard key={u.id} userInfo={u} onSelect={() => signIn(u.id)}/>
                ))}
            </ul>
        </main>
    );
};

export default LoginScreen;
