const User = ({ username, selectChat }) => {
  return (
    <div className="user-list--item" onClick={() => selectChat() }>
      <div className="profile-sec">
        <div className="profile"></div>
        <div className="user-info">
          <h3 className="username">{username}</h3>
          <span>Hey there!</span>
        </div>
      </div>
      <div className="last-msg-time">
        <span>21:30</span>
      </div>
    </div>
  );
};

export default User;
