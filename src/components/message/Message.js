import "./Message.css";

const Message = ({ from, msg, createdAt: time }) => {
  const currentUser = localStorage.getItem("username");
  const getTime = () => {
    const date = new Date(time);
    return `${date.getHours()}:${date.getMinutes()}`;
  };
  return (
    <div
      className={
        from == currentUser ? "message-row right-aligned" : "message-row"
      }
    >
      <div className="message">
        <div className="message-text">{msg.slice(0, 20)}</div>
        <div className="message-time">{getTime()}</div>
      </div>
    </div>
  );
};

export default Message;
