import { useState, useEffect, useRef } from 'react';
import { getContacts, getMessages, sendMessage, getCurrentUser } from '../services/api';
import toast from 'react-hot-toast';
import { Send, User } from 'lucide-react';

export default function ChatInterface() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages(selectedContact.id);
            // Refresh messages periodically
            const interval = setInterval(() => {
                fetchMessages(selectedContact.id, false);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchContacts = async () => {
        try {
            const data = await getContacts();
            setContacts(data);
        } catch (error) {
            console.error("Erreur contacts:", error);
        }
    };

    const fetchMessages = async (contactId, showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await getMessages(contactId);
            setMessages(data);
        } catch (error) {
            console.error("Erreur messages:", error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const sentMsg = await sendMessage(selectedContact.id, newMessage);
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');
        } catch (error) {
            toast.error("Erreur d'envoi du message");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="chat-container card glass chat-layout">
            {/* Liste des contacts */}
            <div className="chat-sidebar">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <h3 style={{ margin: 0 }}>Conversations</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {contacts.length === 0 ? (
                        <p style={{ padding: '1rem', color: 'var(--color-text-light)', textAlign: 'center' }}>Aucun contact disponible.</p>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                style={{ 
                                    padding: '1rem', 
                                    borderBottom: '1px solid var(--color-border)', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    backgroundColor: selectedContact?.id === contact.id ? 'var(--color-primary-light)' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {contact.profile_picture_url ? (
                                        <img src={contact.profile_picture_url} alt={contact.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={20} color="#64748b" />
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{contact.name}</h4>
                                    <small style={{ color: 'var(--color-text-light)' }}>{contact.role === 'admin' ? 'Administration' : (contact.role === 'teacher' ? 'Enseignant' : 'Parent')}</small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Zone de chat */}
            <div className="chat-main">
                {selectedContact ? (
                    <>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {selectedContact.profile_picture_url ? (
                                    <img src={selectedContact.profile_picture_url} alt={selectedContact.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={20} color="#64748b" />
                                )}
                            </div>
                            <h3 style={{ margin: 0 }}>{selectedContact.name}</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isLoading ? (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>Chargement...</div>
                            ) : messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>Aucun message. Commencez la conversation !</div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    return (
                                        <div key={idx} style={{ 
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            backgroundColor: isMe ? 'var(--color-primary)' : 'white',
                                            color: isMe ? 'white' : 'var(--color-text)',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '1rem',
                                            borderBottomRightRadius: isMe ? '0' : '1rem',
                                            borderBottomLeftRadius: isMe ? '1rem' : '0',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
                                            <div style={{ fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--color-text-light)', marginTop: '0.3rem', textAlign: 'right' }}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--color-border)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    style={{ flex: 1, borderRadius: '2rem', paddingLeft: '1.5rem' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={!newMessage.trim()}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)' }}>
                        Sélectionnez une conversation pour commencer
                    </div>
                )}
            </div>
        </div>
    );
}
