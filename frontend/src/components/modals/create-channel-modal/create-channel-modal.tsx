import { useState, type JSX } from "react";
import "./create-channel-modal.css";

interface Props {
    onClose: () => void;
    onCreate: (name: string) => void;
}

//Modal window to create a new channel
function CreateChannelModal({ onClose, onCreate }: Props): JSX.Element {
    const [name, setName] = useState('');

    return (
        <div className="modal-container">
            <div className="modal">
                <h2 className="modal__title">Create new channel</h2>
                <input className="modal__input" type="text" placeholder="New channel name" value={name} onChange={(e) => setName(e.target.value)}/>
                <div className="modal__buttons">
                    <button className="modal__button close-button" onClick={onClose}>Cancel</button>
                    <button className="modal__button action-button" disabled={!name.trim()} onClick={() => onCreate(name.trim())}>Create</button>
                </div>
            </div>
        </div>
    );
}

export default CreateChannelModal;
