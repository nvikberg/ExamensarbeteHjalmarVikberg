import React from 'react';
import '../CSS/ProfilePage.css';

//MOCKAD USER NU MEN SKA H*MTA USER DATA FRÅN DB AV INLOGGAD USER

interface User {
  name: string;
  bio: string;
  profilePic: string;
  email: string;
  phone: string;
  location: string;
}

const ProfilePage: React.FC = () => {
  // Example user data
  const user: User = {
    name: 'John Doe',
    bio: 'A passionate developer who loves building web apps.',
    profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
    email: 'johndoe@example.com',
    phone: '+123456789',
    location: 'New York, USA'
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.profilePic} alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="bio">{user.bio}</p>
        </div>
      </div>

      <div className="profile-details">
        <h3>Contact Information</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Location:</strong> {user.location}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
